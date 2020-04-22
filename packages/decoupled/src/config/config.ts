/**
 * Config
 */
import { get, set } from 'lodash';

export class Config {

    private config: object = {};

    /**
     * Config constructor
     */
    constructor(config) {
        this.config = config || {};
    }

    /**
     * Get configuration value by key
     */
    public get(key: string, defaultValue: any = null): any {
        const value = get(this.config, key);

        return (typeof value === 'undefined') ? defaultValue : value;
    }

    /**
     * Set configuration value for key.
     * Olny changes the in-memory state, does not change config-files
     */
    public set(key: string, value: any = null): any {
        set(this.config, key, value);
        return value;
    }

    /**
     * Load config from 'dehydrated'-state
     */
    public load(input: string) {
        let configs = {};

        if (typeof input === 'string') {
            try {
                configs = JSON.parse(input);
            } catch (error) {
                throw new Error('Can not load configuration from string.');
            }
        } else if (typeof input === 'object') {
            configs = input;
        }

        this.config = configs;
    }

    public destroy() {
        this.config = {};
    }

}
