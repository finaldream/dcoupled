/**
 * TODO: Description here.
 */

import { provideConfig, Config } from '../config';
import { join, resolve } from 'path';
import { Route } from '../router/route';
import { Router } from '../router';
import { Renderer } from '../renderer';
import { Cache } from '../cache/cache';
import { TaskRunner } from '../services/task-runner';
import { GlobalStore } from '../services/global-store';
import { fetch } from '../fetch/fetch';
import SiteServer from './site-server';
import { appPath } from '../lib';
import { initLogger } from '../logger';
import { Logger } from 'decoupled-logger';
import { registerRedirects } from '../redirects/redirect-store';
import { PluginManager } from '../services/plugin-manager';
import { BackendNotify } from '../services/backend-notify';
import { RequestInit, Response } from 'node-fetch';

export class Site {

    public readonly id: string;
    public readonly cache: Cache;
    public readonly config: Config;
    public readonly directory: string;
    public readonly enabled: boolean;
    public readonly logger: Logger;
    public readonly router: Router;
    public readonly renderer: Renderer;
    public readonly server: SiteServer;
    public readonly taskrunner: TaskRunner;
    public readonly globalStore: GlobalStore;
    public readonly plugins: PluginManager;
    public readonly backendNotify: BackendNotify;

    constructor(siteId: string) {

        this.id = siteId;

        this.config = provideConfig(siteId);
        this.logger = initLogger(this.id);

        this.enabled = this.config.get('site.enabled', false);
        this.directory = this.getDirectory();

        if (!this.directory) {
            throw new Error(`Required value 'site.directory' not set for ${siteId}.`);
        }

        this.logger.info('Running', this.id, 'from', this.directory);

        // Stop here if the site is not enabled
        if (!this.enabled) {
            this.logger.info(this.id, 'is disabled by config');
            return;
        }

        registerRedirects(this.config.get('router.redirects'));

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

    public fetch(url: string, init?: RequestInit): Promise<Response> {
        return fetch(this, url, init);
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
        router.addRoutes(routes);

        return router;
    }

}
