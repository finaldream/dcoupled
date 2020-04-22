import { hasDecoupledConfig, getFromDecoupledConfig } from '../config';
import { Logger, logFormat } from 'decoupled-logger';
import { isTestEnvironment } from '../lib/is-test-environment';

export function initLogger(siteId: string, env?: string) {
    const defaultOptions = {
        format: {},
        level: 'info',
        transports: [
            { type: 'Console' },
        ],
    };

    let logging = {};
    // skip errors when running in non-project environments (i.e. tests)
    if (hasDecoupledConfig() && !isTestEnvironment()) {
        try {
            logging = getFromDecoupledConfig('logging', defaultOptions);
        } catch (e) {
            console.error('Can not load default config.');
        }
    }

    const options = { ...defaultOptions, ...logging };
    options.format = logFormat(siteId, options.format);
    // Allow setting a global log-level
    if (process.env.LOG_LEVEL) {
        options.level = process.env.LOG_LEVEL;
    }

    return new Logger(options);
}
