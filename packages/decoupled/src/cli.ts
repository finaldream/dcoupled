/**
 * Main dcoupled-cli
 *
 * Used by ./bin/dcoupled, can also be invoked directly, if required
 */

import dotenv from 'dotenv';
import caporal from 'caporal';
import { serveCommand, serveStaticCommand, generateCommand, watchCommand } from './commands';
import packageJson from '../package.json';

dotenv.config();

process.on('uncaughtException', (err) => {
    console.log(err, err.stack);
});

const app = caporal.version(packageJson.version);

// Register commands
generateCommand(app);
serveCommand(app);
serveStaticCommand(app);
watchCommand(app);

app.parse(process.argv);
