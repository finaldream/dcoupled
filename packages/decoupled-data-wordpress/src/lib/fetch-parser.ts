
import { Response } from 'node-fetch';
import httpError from 'http-errors';
import { get } from 'lodash';
import { Site, replaceInContent } from 'decoupled';

export const parser = async (site: Site, res: Response, type?: string): Promise<AnyObject> => {

    const rules = site.config.get('content.replace.fetched');
    let json: AnyObject = {};

    if (!res.ok) {
        site.logger.error('[WP-API]: reponse not ok', res.url, res.status, res.statusText);
        try {
            const payload = await res.text();
            json = JSON.parse(replaceInContent(payload, rules));
        } catch (e) {
            site.logger.error('[WP-API]: json error', e.message);
            throw e;
        }
        if (json) {
            throw httpError(res.status, res.statusText, { result: json.result, meta: json.meta });
        } else {
            throw httpError(res.status, res.statusText);
        }

    }

    try {
        const text = await res.text();
        json = JSON.parse(replaceInContent(text, rules));
    } catch (e) {
        site.logger.error('[WP-API]: json error', e.message);
        throw e;
    }

    const group = type === 'menus' ? null : 'posts';
    const pagination = {
        total: get(res.headers, '_headers.x-wp-total.0', 1),
        totalPages: get(res.headers, '_headers.x-wp-totalpages.0', 1),
    };

    // TODO: move `meta` from the state up one level to the responseData-object
    const result = {
        meta: json.meta || {},
        pagination,
    };

    if (group) {
        result[group] = json.result;
    } else {
        Object.assign(result, json.result || json);
    }

    return result;
}
