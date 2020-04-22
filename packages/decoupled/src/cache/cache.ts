
import chalk from 'chalk';

import NodeCache from './node-cache';
import RedisCache from './redis-cache';
import { Site } from '../site/site';
import { CacheInterface } from './cache-interface';
import { SiteDependent } from '../lib/common/site-dependent';

export class Cache extends SiteDependent implements CacheInterface {

    // @todo create an interface
    private cache: CacheInterface;

    constructor(site: Site) {

        super(site);

        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.delete = this.delete.bind(this);
        this.clear = this.clear.bind(this);

        this.init();
    }

    public async get(key: string) {
        return this.cache.get(key);
    }

    public set(key: string, data: any, ttl = 60000) {
        return this.cache.set(key, data, ttl);
    }

    public delete(key: string) {
        this.cache.delete(key);
    }

    public clear() {
        this.cache.clear();
    }

    private init() {
        this.logger.debug('Initialize cache configuration');

        // TODO: plug out
        const redis = this.site.config.get('cache.redis', false);

        this.logger.debug(`Using ${chalk.yellow((redis) ? 'REDIS' : 'NODE-CACHE')} as caching service.`);

        // TODO: remove hard-wired cache-provider
        this.cache = (redis) ? new RedisCache(this.site) : new NodeCache(this.site);

    }
}
