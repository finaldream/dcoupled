import path from 'path';
import fs from 'fs';
import { merge } from 'lodash';

/**
 * Read any config file match input pattern
 */
export function readConfigFromFiles(configDir: string, pattern: RegExp): AnyObject {

    const result = {};

    if (!fs.statSync(configDir).isDirectory()) {
        throw new Error(`${configDir} is not a directory`);
    }

    const files = fs.readdirSync(configDir);

    files.forEach((file) => {

        if (file.match(pattern)) {

            const filePath = path.join(configDir, file);

            if (fs.statSync(filePath).isFile()) {
                try {
                    merge(result, (require(filePath) || {})); // eslint-disable-line
                } catch (error) {
                    console.error(filePath, error);
                    throw new Error('Can not load config files');
                }
            }
        }
    });

  return result;
}

const filePatterns = {};

/**
 * Get environment config file pattern
 */
export function getFilePattern(env: string = 'default'): RegExp {

    if (!filePatterns[env]) {
        filePatterns[env] = (env === 'default') ?
            new RegExp('^([^.]*.(js)$)') :
            new RegExp(`^([^.]*.(${env}.js)$)`);
    }

    return filePatterns[env];
}