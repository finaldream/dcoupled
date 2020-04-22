/**
 * Server class for serving dynamic sites
 */

import express from 'express';
import Chalk from 'chalk';

import { appPath, srcDir, getHostName } from '../lib';
import { logger } from '../logger';

import { Site } from '../site/site';
import { getSiteIDs } from '../config';
import { redirectsMiddleware } from '../server/middleware/redirects';

import { defaultBundleManager, BundleManagerMode, BundleManager, BundleFileInfo } from '../bundles'
import { resolve } from 'path';

export class Server {

    public environment: string;
    public app: express.Express;
    public sites: Site[] = [];
    public port: number;
    public host: string;
    public bundleMode: BundleManagerMode = 'build';
    private isConnected: boolean = false;

    constructor(environment) {
        this.environment = environment;
        this.app = express();
    }

    getSiteIds(includeDefault: boolean = false) {
        return getSiteIDs(this.getContextPath(), includeDefault);
    }

    public getContextPath(): string {
        return srcDir('sites');
    }

    public init() {

        // register redirect middleware before any site-server
        this.app.use(redirectsMiddleware(logger));

        defaultBundleManager.mode = this.bundleMode
        defaultBundleManager.bundleDirectory = resolve(appPath())
        defaultBundleManager.addBundles(this.getSiteIds(true));
        defaultBundleManager.on(BundleManager.BUNDLES_LOADED, this.handleBundlesLoaded)
        defaultBundleManager.process()

    }

    handleBundlesLoaded = (bundles: BundleFileInfo[]) => {

        if (!this.isConnected) {
            this.initSites()
            this.listen()

            return;

        }

        this.sites.forEach(site => site.reload())

    }

    public vhost = (req, res, next) => {

        const hostname = getHostName(req, true);

        const site = this.sites.find(site => site.domains.includes(hostname));
        const app: any = site.server.app;

        console.log('vhost', hostname, site.id)

        if (app) {
            app(req, res, next);
        } else {
            return next()
        }

    }

    private initSites() {
        logger.info('Server: Initialize Sites');
        for (const siteId of this.getSiteIds()) {
            const site = new Site(siteId);

            if (!site.enabled) {
                continue;
            }

            site.connect();

            this.sites.push(site);
            this.app.use(this.vhost);
        }
    }

    private listen() {

        this.app.listen(this.port, this.host, () => {

            this.isConnected = true;

            logger.log('info', Chalk.green(`Server listening on http://${this.host}:${this.port}`));

            const maybePort = this.port !== 80 ? `:${this.port}` : '';

            for (const site of this.sites) {
                site.logger.info(Chalk.green(`Listening on http://${site.host}${maybePort}`));
            }

        });
    }

}
