/**
 * SiteServer class for single site
 */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { fixTrailingSlash, isAbsoluteUrl, shouldFixTrailingSlash } from '../lib';
import { ResponseData } from '../router/response-data';
import { ServerRequest, ServerResponse } from '../server';

// Connect Middleware
import basicAuth from '../server/middleware/basic-auth';
import errorHandle from '../server/middleware/error-handle';
import expiresHeader from '../server/middleware/expires-header';
import requestLogger from '../server/middleware/request-logger';
import statusCodeHelper from '../server/middleware/status-code-helper';
import { SiteDependent } from '../lib/common/site-dependent';

// TODO: Merge Server & Site-Server
export default class SiteServer extends SiteDependent {

    public app: any;

    constructor(site) {
        super(site);

        this.app = express();
        this.handleRequest = this.handleRequest.bind(this);
    }

    public connect(): any {

        this.app.use(requestLogger(this.logger));
        this.app.use(statusCodeHelper);
        this.app.use(basicAuth());
        this.app.use(expiresHeader());
        this.app.use(bodyParser.json());

        // Set up static file locations
        this.staticFiles.forEach(({ uri, path: dir, ...options }) => {
            this.logger.debug('Serving static files from:', dir);

            this.app.use(uri, express.static(path.resolve(dir), options));
        });

        this.app.use((req, res) => this.handleRequest(new ServerRequest(req), res));
        this.app.use(errorHandle);

        return this.app;
    }

    get staticFiles(): AnyObject[] {
        const files = this.site.config.get('router.staticFiles', []);

        return (!Array.isArray(files)) ? [files] : files;
    }

    /**
     * Handle error response
     */
    public async handleError(res = null, error, responseData: ResponseData) {

        this.logger.error(error);

        const errorCode = error.statusCode || 500;

        const renderError = this.site.config.get('render.renderError', true);
        const traceError = this.site.config.get('render.traceError', false);

        const errorState = {
            code: errorCode,
            error: (traceError) ? error : false,
            meta: error.meta || {
                template: 'error',
            },
        };

        if (error.result) {
            Object.assign(errorState, { posts: error.result });
        }

        Object.assign(responseData.state, errorState);

        let body = JSON.stringify(error);

        if (renderError) {
            try {
                body = await this.site.renderer.render(responseData);
            } catch (e) {
                this.logger.error(e);
            }
        }

        res.statusCode = errorCode;
        res.write(body);
        res.end();
    }

    /**
     * Handle redirect response
     */
    public handleRedirect(res: ServerResponse, data) {

        const { statusCode = 301, location = '/' } = data;

        this.logger.info(`SiteServer.handleRedirect: Redirect (${statusCode}) to "${location}"`);

        res.writeHead(statusCode, { Location: location });
        res.end();
    }

    /**
     * Handle regular response
     */
    public async handleResponse(req: ServerRequest, res: ServerResponse, responseData: ResponseData) {
        const route = req.route;
        const docType = route.docType;

        const answer = await this.site.renderer.render(responseData);
        const content = `${docType}${answer}`;

        if (route.expires) {
            res.expires(route.expires);
        }

        if (route.statusCode) {
            res.statusCode = route.statusCode;
        }

        if (route.headers && typeof res.header === 'function') {
            Object.entries(route.headers).forEach(([k, v]) => res.setHeader(k, v));
        }

        res.setHeader('Content-Length', Buffer.byteLength(content, 'utf-8'));

        res.write(content);
        res.end();
    }

    /**
     * Handle regular request
     */
    public async handleRequest(request: ServerRequest, response: ServerResponse) {

        if (response.headersSent) {
            return void 0;
        }

        this.logger.debug('SiteServer.handleRequest', this.site.id, request.method, request.originalUrl);

        try {

            // Initialize response code & headers
            if (typeof response.header === 'function') {
                // TODO: set directly when creating the response, so it will always report correct values.
                const statusCode = this.site.config.get('router.statusCode', 200);
                const headers = this.site.config.get('router.headers', {});
                const expires = this.site.config.get('router.expires', 2592000);

                response.expires(expires);
                response.statusCode = statusCode;
                Object.entries(headers).forEach(([k, v]) => response.header(k, v));
            }

            // Resolve state data
            let result = new ResponseData();
            let redirect = null;

            if (shouldFixTrailingSlash(request.path)) {
                redirect = request.path;
            } else {
                result = await this.site.router.resolveUrl(request, response);
                redirect = result && result.state && result.state.redirect;
            }

            // Handle redirects
            if (redirect) {
                const location = isAbsoluteUrl(redirect)
                    ? redirect
                    : `${request.hostUrl}${redirect}`;
                const statusCode = result.state && result.state.statusCode || 301;
                const data = { statusCode, location: fixTrailingSlash(location) };
                this.handleRedirect(response, data);

                return void (0);
            }

            // Handle errors
            if (result.state && result.state.error) {
                const { error } = result.state;
                await this.handleError(response, error, result);
                return void (0);
            }

            /**
             * Writing final response
             */
            await this.handleResponse(request, response, result);

            return void (0);

        } catch (err) {
            await this.handleError(response, err, new ResponseData());
        }
    }

    public destroy() {
        this.app.stack = [];
    }
}
