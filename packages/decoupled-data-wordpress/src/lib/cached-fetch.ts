import { Site, genAPICacheKey } from 'decoupled';
import { parser, urlGenerator } from './';

export const cachedFetch = async (site: Site, { type, params }): Promise<AnyObject> => {
    
    const { endpoint } = site.config.get('services.wpapi');

    const url = urlGenerator(endpoint, type, params);  
    
    site.logger.debug('[WP-API]', `Requesting cachedFetch ${url}`);

    const cacheKey = genAPICacheKey(type, params);
    const cached: AnyObject | void = await site.cache.get(cacheKey);

    if (cached) {
        site.logger.debug('[WP-API]', `returning cached result for ${url}`);
        return cached;
    }

    site.logger.debug('[WP-API]', `no cached result for ${url}`);

    const res = await site.fetch(url);
    const parsed = await parser(site, res, type);
    try {
        // TODO: use Expiry headers
        site.cache.set(cacheKey, parsed, 6000);
    } catch (e) {
        site.logger.error('[WP-API]: Error setting cache:', e.message);        
    }

    return parsed;
};
