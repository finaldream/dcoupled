/**
 * Formats an array of options.
 *
 * Used for CLI output.
 */
import { join } from 'path';
import { getSiteIDs } from '../config';
import { logger } from '../logger';
import { asciiBanner } from '../lib/ascii-banner';

let sitesCache = null;
export const sites = () => sitesCache ? sitesCache : sitesCache = getSiteIDs() && sitesCache;
// TODO: make dynamic, i.e. provider.getEnvironments()
// first env is used as default env

export const choices = (values) => new RegExp(`\\b${values.join('\\b|\\b')}\\b`);

/**
 * Prepares input for an action. Should be called by all actions.
 *
 * I.e. validating the environment and site
 *
 * @param {Object} args Args from CLI
 * @param {Object} options Options from CLI
 *
 * @returns {Object} Input is validated and merged into a single object.
 */
export async function prepareAction(args, options) {
    const opts = Object.assign({}, args, options);

    // Prepare environment, syncronize args.env with NODE_ENV
    opts.env = opts.env || getDefaultEnv();
    // keep both in sync
    process.env.NODE_ENV = opts.env;

    // TODO: Fix / find another way
    // if (!sites().includes(opts.site)) {
    //     throw new Error(`Unknown site "${opts.site}"`);
    // }

    logger.info(asciiBanner(opts.env));

    return opts;
}

export function getDefaultEnv() {

    return process.env.NODE_ENV || 'development';

}

