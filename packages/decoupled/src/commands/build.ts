import { getDefaultEnv, prepareAction } from './utils';
import { Server } from '../server';

/**
 * Implementation of the serve-command's action.
 * @param {Object} args
 * @param {Object} options
 */
export async function buildAction(args, options) {
    const opts = await prepareAction(args, options);
    const { env, host, port } = opts;

    const server = new Server(env);

    server.host = host || process.env.HOST || '127.0.0.1';
    server.port = port || process.env.PORT || 3000;
    server.bundleMode = 'build';

    server.init();
}

/**
 * Defintion of the `serve`-command
 *
 * @param {Caporal} app
 */
export function watchCommand(app) {
    app
        .command('build', 'Builds the application without starting a server')
        .argument('[env]', `Current environment`, null, getDefaultEnv())
        .action(buildAction);
}
