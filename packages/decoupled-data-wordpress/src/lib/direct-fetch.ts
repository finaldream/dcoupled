
import { Site } from 'decoupled';
import { parser, urlGenerator } from './';

export const directFetch = async (site: Site, { type, params }): Promise<AnyObject> => {

    const { endpoint } = site.config.get('services.wpapi');

    const url = urlGenerator(endpoint, type, params);    
    
    site.logger.debug('[WP-API]', `Requesting directFetch ${url}`);

    const res = await site.fetch(url);
    const parsed = await parser(site, res, type);

    return parsed;
}
