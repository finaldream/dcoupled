import { resolve, join } from 'path';
import { configFromFiles } from './provide-config-file';
import { Config } from '.';

let decoupledConfig: Config;

function ensureConfig(): Config | undefined {

    if (!decoupledConfig) {
        try {
            decoupledConfig = configFromFiles([
                join(__dirname, 'default-decoupled-config.js'),
                resolve('decoupled.config')
            ])
        } catch (e) {
            console.error(e)
            decoupledConfig = undefined;
        }
    }

    return decoupledConfig;
}

export const hasDecoupledConfig = (): boolean => {
    ensureConfig();
    return decoupledConfig !== null;
};

export const getFromDecoupledConfig = (keyPath: string, defaultValue: any = null): any => {

    if (!hasDecoupledConfig()) {
        return defaultValue
    }

    const config = ensureConfig()

    if (!config) {
        throw new Error(`Decoupled Config not available. (${keyPath})`)
    }

    return config.get(keyPath, defaultValue);
};
