/**
 * Backend Notify
 */

import { SiteDependent } from '../lib/common/site-dependent';
import { Site } from '../site/site';
import fetch from 'node-fetch';

export class BackendNotify extends SiteDependent {

    private notifyEndpoint: string = null;

    /**
     * BackendNotify constructor
     * @param site Site
     * @param notifyPath string
     */

    constructor(site: Site, notifyPath?: string) {

        super(site);

        if (!notifyPath) {
            this.logger.debug('[BACKEND NOTIFY] No endpoint path provided!');
            return;
        }

        this.notifyEndpoint = `${site.config.get('services.wpapi.endpoint')}${notifyPath}`;
        this.logger.info('Intialized BACKEND NOTIFY service');
        this.logger.debug('[BACKEND NOTIFY] intialized with endpoint:', this.notifyEndpoint);

    }

    /**
     * sendNotification
     * Send notification to the Decoupled Backend
     * Accept a string or object as message and an optional array of strings tags
     * @param message string|object
     * @param senderTags string[]
     */

    public async sendNotification(message: string | object, senderTags?: string[]) {

        if (!this.notifyEndpoint) {
            this.logger.silly('[BACKEND NOTIFY] not sending, no endpoint defined.', senderTags);
            return;
        }

        const body = this.prepareMessage(message, senderTags);
        try {
            await this.postMessage(body);
            this.logger.info('[BACKEND NOTIFY] message sent');
            this.logger.debug('[BACKEND NOTIFY] message succesfully sent:', message);
            this.logger.silly('[BACKEND NOTIFY] ...with the following tags:', senderTags);
            return true;
        } catch (err) {
            this.logger.error('[BACKEND NOTIFY] Could not send message:', message, err.message);
            return false;
        }
    }

    private prepareMessage(content: string | object, senderTags?: string[]) {
        const message = {
            date: new Date().toISOString(),
            tags: [...senderTags],
            payload: content,
        };
        return JSON.stringify(message);
    }

    private async postMessage(body: string) {
        const headers = { 'Content-Type': 'application/json' };
        // TODO: unify fetch-function with api-fetch.ts https://finaldream.atlassian.net/browse/DC-36
        const authentication = this.site.config.get('services.wpapi.authentication');
        if (authentication) {
            if (authentication.username && authentication.password) {
                const encoded = new Buffer(`${authentication.username}:${authentication.password}`).toString('base64');
                Object.assign(headers, { Authorization: `Basic ${encoded}` });
            }
            if (authentication.token) {
                Object.assign(headers, { 'decoupled-token': authentication.token });
            }
        }
        const res = await fetch(this.notifyEndpoint, {
            method: 'post',
            body,
            headers
        });
        if (!res.ok) {
            throw new Error(res.status);
        }
        return res;
    }
}
