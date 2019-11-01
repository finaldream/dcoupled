/**
 * Populate metalsmith source files from API
 */

import Chalk from 'chalk';
import promiseMap from 'promise.map';

import { Router } from '../../router';
import { removeTrailingSlash, ServerRequest } from '../../lib';
import { ServerResponse } from 'http';
import { Site } from '../../site/site';
import { SiteDependent } from '../../lib/common/site-dependent';

const DEFAULT_CONCURRENCY = 8;

class WpApi extends SiteDependent {


    constructor(site: Site) {
        super(site);
    }

    /**
     * Run this plugin
     * @returns {Promise}
     */
    public async run(files, metalsmith, done) {
        // Get an index of all posts
        const posts = await this.fetchList();
        this.logger.info(`Fetched ${posts.length} posts.`);

        if (!posts || !posts.length) {
            this.logger.info('Got empty file-list from server. Nothing to do.');
            done();
            return;
        }

        const router = new Router(this.site);
        router.addRoutes([]);

        // iterate each post & language
        const states = {};
        const concurreny = this.site.config.get('generator.concurrency', DEFAULT_CONCURRENCY);

        await promiseMap(
            posts,
            async (post) => {
                const permalink = decodeURIComponent(post.permalink);

                const req = new ServerRequest({ url: permalink });
                const res = new ServerRequest();

                try {
                    // TODO: this probably won't work for the generator!
                    states[post.permalink] = await router.resolveUrl(req, res);
                } catch (e) {
                    this.logger.error(post.permalink, e.message);
                }
            },
            concurreny,
        );

        Object.assign(files, states);

        done();
    }

    public async fetchList() {
        return [];
    }
}

module.exports = function wpApi(site: Site) {
    return function wpApiPlugin(files, metalsmith, done) {
        const plugin = new WpApi(site);

        try {
            plugin.run(files, metalsmith, done);
        } catch (error) {
            site.logger.error(`${Chalk.red('error')} ApiPluginError:`, error.message, error.stack);
        }
    };
};
