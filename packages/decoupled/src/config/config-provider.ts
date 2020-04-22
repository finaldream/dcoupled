import { merge } from 'lodash';
import Chalk from 'chalk';
import { Config } from './config';
import { ConfigValidator } from './config-validator';
import { Bundle, defaultBundleManager } from '../bundles';
import { logger } from '../logger';

const configCache = new Map();
const filePatterns = {};

export class ConfigProvider {

    private static getFilePattern(env: string = 'default'): RegExp {
        if (!filePatterns[env]) {
            filePatterns[env] = (env === 'default') ?
                new RegExp('^\.\/([^.]*\.(ts|js)$)') :
                new RegExp(`^\.\/([^.]*\.${env}\.(ts|js)$)`);
        }

        return filePatterns[env];
    }

    private validator: ConfigValidator;

    constructor() {
        this.validator = new ConfigValidator();
    }

    public loadFromBundle(siteId: string, env: string = process.env.NODE_ENV): Config {
        const cacheKey = `${siteId}/${env}`;

        if (configCache.has(cacheKey)) {
            return configCache[cacheKey];
        }

        const bundles = [];

        const defaultBundle = defaultBundleManager.getBundle('default');
        if (!defaultBundle) {
            logger.warn(`Config: Bundle for "default" not found`);
        } else {
            bundles.push(defaultBundle);
        }

        const siteBundle = defaultBundleManager.getBundle(siteId);
        if (!siteBundle) {
            logger.error(`Config: Bundle for "${siteId}" not found`);
            return null;
        } else {
            bundles.push(siteBundle);
        }

        const raw = bundles.map((bundle) => this.loadConfig(bundle, env));
        const configs = merge({}, ...raw);

        // start configs validation process
        const start = process.hrtime();
        logger.debug(Chalk.yellow('Start config validation.'));

        const errors = this.validator.validate(configs);
        const end = process.hrtime(start);

        logger.debug(Chalk.yellow(`Config validation finished, took ${end[0]}.${end[1]}s`));

        if (errors) {
            logger.error(errors);
            throw new Error('Config validation failed.');
        }

        const dehydrated = this.validator.getDehydratedSchema();

        const config = new Config(configs);
        configCache[cacheKey] = config;

        return config;
    }

    private loadConfig(bundle: Bundle, env: string) {
        const defaultConfig = this.loadConfigFromBundle(bundle, 'default');

        if (!env) {
            return defaultConfig;
        }

        const envConfig = this.loadConfigFromBundle(bundle, env);

        return merge(defaultConfig, envConfig);
    }

    private loadConfigFromBundle(bundle: Bundle, env: string): AnyObject {
        let result = {};

        const { config } = bundle || {};
        const { keys } = config || {};
        const pattern = ConfigProvider.getFilePattern(env);

        if (!config || typeof config.keys !== 'function') {
            logger.error(`Bundle ${bundle.siteId} config.keys is not a function.`);
            return {};
        }

        const configKeys = keys();

        if (!configKeys || !configKeys.length) {
            logger.warn(`No config-keys found in bundle ${bundle.siteId}`);
            return {};
        }

        configKeys.forEach((key) => {
            if (key.match(pattern)) {
                let value = config(key);
                if (value.default) {
                    value = merge({}, value, value.default);
                    delete value.default;
                }
                result = merge({}, result, value);
            }
        });

        return result;
    }
}
