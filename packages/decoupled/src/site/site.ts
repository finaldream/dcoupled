/**
 * TODO: Description here.
 */

import { provideConfigFromBundle, Config } from '../config';
import { join, resolve } from 'path';
import { Route } from '../router/route';
import { Router } from '../router';
import { Renderer } from '../renderer';
import { Cache } from '../cache/cache';
import { TaskRunner } from '../services/task-runner';
import { GlobalStore } from '../services/global-store';
import { cachedFetch } from '../fetch';
import SiteServer from './site-server';
import { appPath } from '../lib';
import { initLogger } from '../logger';
import { Logger } from 'decoupled-logger';
import { registerRedirects } from '../redirects/redirect-store';
import { PluginManager } from '../services/plugin-manager';
import { BackendNotify } from '../services/backend-notify';
import { Bundle } from '../bundles/bundle';
import { defaultBundleManager } from '../bundles';
import { ConfigProvider } from '../config/config-provider';

export class Site {

    public id: string;
    public cache: Cache;
    public config: Config;
    public directory: string;
    public domains: string[];
    public enabled: boolean;
    public logger: Logger;
    public router: Router;
    public renderer: Renderer;
    public server: SiteServer;
    public taskrunner: TaskRunner;
    public globalStore: GlobalStore;
    public plugins: PluginManager;
    public backendNotify: BackendNotify;

    constructor(siteId: string) {

        this.id = siteId;

        this.logger = initLogger(this.id);

        const configProvider = new ConfigProvider();
        this.config = configProvider.loadFromBundle(siteId);

        this.enabled = this.config.get('site.enabled', false);
        // TODO: remove in favour of bundles
        this.directory = this.getDirectory();
        this.domains = [this.config.get('site.domain')];

        // TODO: Do we still need this?
        if (!this.directory) {
            throw new Error(`Required value 'site.directory' not set for ${siteId}.`);
        }

        this.logger.debug('Running', this.id, 'from', this.bundle.shortFilename);

        // Stop here if the site is not enabled
        if (!this.enabled) {
            this.logger.info(this.id, 'is disabled by config');
            return;
        }

        // TODO: Hot Reload Redirects
        registerRedirects(this.config.get('router.redirects', []));

        this.plugins = new PluginManager(this, this.config.get('plugins'));
        this.cache = new Cache(this);
        this.renderer = new Renderer(this, this.config.get('render.engine', null));
        this.router = this.makeRouter();
        this.taskrunner = new TaskRunner(this, this.config.get('tasks'));
        this.globalStore = new GlobalStore();
        this.backendNotify = new BackendNotify(this, this.config.get('backendnotify.path', null));

        // When all done, init the server
        this.server = new SiteServer(this);
    }

    public get host() {
        return this.config.get('site.domain');
    }

    public get bundle(): Bundle {
        return defaultBundleManager.getBundle(this.id)
    }

    public reload() {

        this.server.destroy();
        // this.taskrunner.destroy();
        this.globalStore.clear();
        this.config.destroy();

        this.logger.info('Reloading', this.id, 'from', this.bundle.shortFilename);

        this.config = provideConfigFromBundle(this.id);

        this.plugins = new PluginManager(this, this.config.get('plugins'));
        this.renderer = new Renderer(this, this.config.get('render.engine', null));
        this.router = this.makeRouter();
        // this.taskrunner = new TaskRunner(this, this.config.get('tasks'));
        this.backendNotify = new BackendNotify(this, this.config.get('backendnotify.path', null));
    }

    /**
     * Wrapper for cachedFetch()
     *
     * @TODO: generalize and simplify, get rid of type...
     */
    public cachedFetch(params): object {
        return cachedFetch(this, params);
    }

    public connect(): any {
        return this.server.connect();
    }

    private getDirectory() {
        const dir = this.config.get('site.directory', join('sites', this.id));
        return resolve(appPath(), dir);
    }

    private makeRouter() {
        const routes: Route[] = this.config.get('router.routes', []).map((route) => new Route(route));

        const router = new Router(this);
        router.addRoutesWithDefaults(routes);

        return router;
    }

}
