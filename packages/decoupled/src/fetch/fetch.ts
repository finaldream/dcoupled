
import { Site } from '../site/site';
import chalk from 'chalk';
import nodeFetch, { RequestInit, Response } from 'node-fetch';

const defaultInit : RequestInit = { headers: {} };

export const fetch = async (site: Site, url: string, init : RequestInit = defaultInit ): Promise<Response> => {


    site.logger.debug('decoupled-fetch', `Requesting ${url}`);

    const authentication = site.config.get('services.wpapi.authentication');
    if (authentication) {
        if (authentication.username && authentication.password) {
            const encoded = new Buffer(`${authentication.username}:${authentication.password}`).toString('base64');
            Object.assign(init.headers, { Authorization: `Basic ${encoded}` });
        }
        if (authentication.token) {
            Object.assign(init.headers, { 'decoupled-token': authentication.token });
        }
    }

    let result;
    
    try {
        result = await nodeFetch(url, init);
    } catch (e) {
        site.logger.error('decoupled-fetch', url, e.message);
        throw e;
    }

    site.logger.debug('decoupled-fetch', chalk.green('success'), url);

    return result;
};
