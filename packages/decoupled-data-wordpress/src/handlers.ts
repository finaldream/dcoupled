import { get } from 'lodash';
import { directFetch , cachedFetch} from './lib';
import { Site, ServerRequest, genAPICacheKey, DelayedQueue, delayedCacheInvalidate } from 'decoupled';

const invalidationQueues: Map<Site, DelayedQueue> = new Map();

export const handleMenus = async (site: Site) => {

    site.logger.debug('[WP-API]', 'handleMenus invoked');

    const params = {
        lang: 'all',
    };
    const type = 'menus';

    const result = await cachedFetch(site, { type, params });
    
    return Object.assign({}, result);
};

export const handleRouteWithSlug = async (site: Site, req: ServerRequest) => {

    site.logger.debug('[WP-API]', 'handleRouteWithSlug invoked');

    let slug = req.params._ || req.url;

    // only send the URL, get rid of the query-part
    slug = slug.split('?').shift();

    const queries = req.query || {};
    const type = 'permalink';
    const params = { q: slug, ...queries };

    if (queries.preview) {
        return await directFetch(site, { type, params });
    }

    return await cachedFetch(site, { type, params });
};

export const handleCacheInvalidate = async (site: Site, req: ServerRequest) => {
    
    site.logger.debug('[WP-API]', 'handleCacheInvalidate invoked');

    const data = (req.body && req.body.cache) ? req.body.cache : false;
    const invalidator = site.config.get('cache.invalidator', false);

    let queue = invalidationQueues.get(site);

    if (!data) {
        return { error: 'Invalid request' };
    }

    switch (data.action) {

        case 'destroy':
            const type = get(data, 'params.type');
            const params = {
                q: get(data, 'params.slug'),
            };

            const cacheKey = genAPICacheKey(type, params);

            site.cache.delete(cacheKey);

            if (invalidator) {
                if (!queue) {
                    queue = new DelayedQueue(
                        site.config.get('cache.invalidationTimeout', 15000),
                        (items) => delayedCacheInvalidate(site, items),
                    );
                    queue.logger = site.logger;
                    invalidationQueues.set(site, queue);
                }

                queue.push(data);
            }

            break;

        case 'flush':
            site.cache.clear();
            if (invalidator) {
                if (queue) {
                    queue.reset();
                }

                await delayedCacheInvalidate(site, ['/*']);
            }

            break;
    }

    return { status: 'ok' };
};

export const handlePreviewRequest = async (site: Site, req: ServerRequest) => {

    site.logger.debug('[WP-API]', 'handlePreviewRequest invoked');

    const type = 'preview';
    const params = req.query || {};
       
    return await directFetch(site, { type, params });
};
