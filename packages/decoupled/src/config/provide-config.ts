/**
 * Config Provider
 */

import { merge } from 'lodash';
import path from 'path';
import { Config } from './config';
import { appPath } from '../lib';
import { readConfigFromFiles, getFilePattern } from '../utils/config-reader';

const configCache = new Map();

/**
 * Return environment config for single site
 */
export function loadConfig(domain: string, env: string, rootPath?: string): AnyObject {

    const basePath = !rootPath
        ? appPath('config')
        : rootPath;
    const defaultPath = path.join(basePath, domain);
    const defaultConfig = readConfigFromFiles(defaultPath, getFilePattern());

    if (!env) {
        return defaultConfig;
    }

    const pattern = getFilePattern(env);
    const envConfig = readConfigFromFiles(defaultPath, pattern);

    return merge(defaultConfig, envConfig);
}

/**
 * Returns the config for a specified site-id/environment combination.
 * Requested configs are cached, so that they are initialized only once.
 *
 * @param siteId site-id to load
 * @param environment environment version. Defaults to NODE_ENV or 'development'
 * @param rootPath path to look for a config
 */
export function provideConfig(siteId: string, environment?: string, rootPath?: string): Config {


    const env = environment || process.env.NODE_ENV;
    const cacheKey = `${siteId}/${environment}`;

    if (configCache.has(cacheKey)) {
        return configCache[cacheKey];
    }

    const rootConfigPath = path.resolve(rootPath || appPath('config'));


    const defaultConfig = loadConfig('default', env, rootConfigPath);
    const siteConfig = siteId !== 'default' ? loadConfig(siteId, env, rootConfigPath) : {};

    const config = new Config(merge(defaultConfig, siteConfig));
    configCache[cacheKey] = config;

    return config;

}
