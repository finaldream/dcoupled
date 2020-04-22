/**
 * Config Provider
 */

import { merge } from 'lodash';
import { Config } from './config';
import { defaultBundleManager, Bundle } from '../bundles';
import { logger } from '../logger';

const configCache = new Map();
/**
 * Read any config file match input pattern
 */
function readConfigFromFiles(bundle: Bundle, env: string): AnyObject {

    let result = {};
    const pattern = getFilePattern(env);

    const { config } = bundle || {};
    const { keys } = config || {};

    if (!config || typeof config.keys !== 'function') {
        logger.error(`Bundle ${bundle.siteId} config.keys is not a function.`)
        return {}
    }

    const configKeys = keys()


    if (!configKeys || !configKeys.length) {
        logger.warn(`No config-keys found in bundle ${bundle.siteId}`)
        return {}
    }

    configKeys.forEach((key) => {
        if (key.match(pattern)) {
            let value = config(key)
            if (value.default) {
                value = merge({}, value, value.default)
                delete value.default
            }
            result = merge({}, result, value)
        }
    });

    return result;
}

const filePatterns = {};

/**
 * Get environment config file pattern
 */
function getFilePattern(env: string = 'default'): RegExp {

    if (!filePatterns[env]) {
        filePatterns[env] = (env === 'default') ?
            new RegExp('^\.\/([^.]*\.(ts|js)$)') :
            new RegExp(`^\.\/([^.]*\.${env}\.(ts|js)$)`);
    }

    return filePatterns[env];
}

/**
 * Return environment config for single site
 */
function loadConfig(bundle: Bundle, env: string): AnyObject {

    const defaultConfig = readConfigFromFiles(bundle, 'default');

    if (!env) {
        return defaultConfig;
    }

    const envConfig = readConfigFromFiles(bundle, env);

    return merge(defaultConfig, envConfig);
}

/**
 * Returns the config for a specified site-id/environment combination.
 * Requested configs are cached, so that they are initialized only once.
 *
 * @param siteId site-id to load
 * @param environment environment version. Defaults to NODE_ENV or 'development'
 */
export function provideConfigFromBundle(siteId: string, environment?: string): Config {

    const env = environment || process.env.NODE_ENV
    const cacheKey = `${siteId}/${environment}`

    if (configCache.has(cacheKey)) {
        return configCache[cacheKey];
    }


    const bundles = [];

    // TODO: instead indirect inheritance, use an explicit "extend-key"
    const defaultBundle = defaultBundleManager.getBundle('default');
    if (!defaultBundle) {
        logger.error(`Config: Bundle for "default" not found`)
        return null;
    } else {
        bundles.push(defaultBundle);
    }

    const siteBundle = defaultBundleManager.getBundle(siteId);
    if (!siteBundle) {
        logger.error(`Config: Bundle for "${siteId}" not found`)
        return null;
    } else {
        bundles.push(siteBundle);
    }

    const configs = bundles.map((bundle) => loadConfig(bundle, env));

    const config = new Config(merge({}, ...configs));
    configCache[cacheKey] = config;


    return config;

}
