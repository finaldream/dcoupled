/**
 * Config Provider
 */

import { merge } from 'lodash';
import fs from 'fs';
import path from 'path';
import { Config } from './config';
import { getSitePath } from '../lib/get-site-path';
import { getFromDecoupledConfig } from './decoupled-config';

const configCache = new Map();

const readConfigFromFiles = (files: string[]): AnyObject => {

    const result = {}

    files.forEach((file) => {
        try {
            merge(result, (require(file) || {})); // eslint-disable-line
        } catch (error) {
            console.error(file, error);
            throw new Error('Can not load config files');
        }
    });

    return result

}

/**
 * Read any config file match input pattern
 */
function readConfigFromDir(configDir: string, env: string): AnyObject {

    if (!fs.statSync(configDir).isDirectory()) {
        throw new Error(`${configDir} is not a directory`);
    }

    const pattern = getFilePattern(env);
    const files = fs.readdirSync(configDir);
    const filteredFiles = []

    files.forEach((file) => {

        if (file.match(pattern)) {

            const filePath = path.join(configDir, file);

            if (fs.statSync(filePath).isFile()) {
                filteredFiles.push(filePath);
            }
        }
    });

    return readConfigFromFiles(filteredFiles);
}

const filePatterns = {};

/**
 * Get environment config file pattern
 */
function getFilePattern(env: string = 'default'): RegExp {

    if (!filePatterns[env]) {
        filePatterns[env] = (env === 'default') ?
            new RegExp('^([^.]*\.(ts|js)$)') :
            new RegExp(`^([^.]*\.${env}\.(ts|js)$)`);
    }

    return filePatterns[env];
}

/**
 * Return environment config for single site
 */
function loadConfig(configPath: string, env: string): AnyObject {

    const defaultConfig = readConfigFromDir(configPath, env);

    if (!env) {
        return defaultConfig;
    }

    const envConfig = readConfigFromDir(configPath, env);

    return merge(defaultConfig, envConfig);
}

/**
 * Returns the config for a specified site-id/environment combination.
 * Requested configs are cached, so that they are initialized only once.
 *
 * @param siteId site-id to load
 * @param environment environment version. Defaults to NODE_ENV or 'development'
 */
export function provideConfig(siteId: string, environment?: string): Config {

    const env = environment || process.env.NODE_ENV;
    const cacheKey = `${siteId}/${environment}`;

    if (configCache.has(cacheKey)) {
        return configCache[cacheKey];
    }

    // check for custom config definition first. Paths need to be absolute.
    let paths = getFromDecoupledConfig(`sites.${siteId}.configs`, null);

    // Preset configs: default + site
    if (!paths) {
        paths = [getSitePath('default', 'config')];
        if (siteId !== 'default') {
            paths.push(getSitePath(siteId, 'config'));
        }
    }

    const configs = paths.map((p) => loadConfig(p, env));

    const config = new Config(merge({}, ...configs));
    configCache[cacheKey] = config;

    console.log(
        'Configs',
        paths,
        config,
    )

    return config;

}

export function configFromPaths(paths: string[], environment?: string): Config {

    const env = environment || process.env.NODE_ENV;
    const configs = paths.map((p) => loadConfig(p, env));
    const config = new Config(merge({}, ...configs));
    return config;

}

export function configFromFiles(filePaths: string[]): Config {

    return new Config(readConfigFromFiles(filePaths));

}
