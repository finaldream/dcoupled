import { getServerSideConfig, getClientSideConfig } from '.';
import webpack, { compilation, Compiler, ICompiler, Stats } from 'webpack';
import { logger } from '../logger';
import Chalk from 'chalk';
import { BundleFileInfo } from '../bundles';
import { join } from 'path';
import { getFromDecoupledConfig } from '../config';
import { isHash, setHash } from './utils/hash';
import { DecoupledWebpackPlugin } from './utils/decoupled-webpack-plugin';
import { friendlyErrors } from './utils/friendly-errors';


const printErrors = (stats: Stats) => {

    const errors = friendlyErrors(stats, 'error')
    const warnings = friendlyErrors(stats, 'warning')

    if (errors && errors.length) {
        errors.forEach(error => logger.error(error))
    }

    if (warnings && warnings.length) {
        warnings.forEach(warning => logger.warn(warning))
    }

}

export const compile = (callback, watch: boolean) => {

    const serverConfig = getServerSideConfig(watch)
    const browserConfig = getClientSideConfig(watch)
    const compiler = webpack([serverConfig, browserConfig]);
    //const compiler = webpack(serverConfig);

    logger.silly(() => ['Webpack Server Config', serverConfig])
    logger.silly(() => ['Webpack Browser Config', browserConfig])

    new DecoupledWebpackPlugin().apply(compiler);

    const compilerHandler = (error, multiStats: compilation.MultiStats) => {
        if (error) {
            console.error(error);
        } else {

            multiStats.stats.forEach(stats => {
                const comp = stats.compilation as any;

                if (isHash(comp.name, stats.hash)) {
                    logger.debug(`Compilation hash unchanged, skipping reload`)
                    return;
                }

                setHash(comp.name, stats.hash);

                logger.info(Chalk.green(`Compilation finsished, took ${stats.endTime - stats.startTime}ms(hash: ${stats.hash})`))

                printErrors(stats)


                if (comp.name !== 'server') {
                    return
                }

                const bundles: BundleFileInfo[] = [];

                // console.log(stats.compilation.chunks);

                stats.compilation.chunks.forEach(({ name, files }) => {
                    bundles.push({
                        id: name,
                        file: files.find(i => /\.js$/.test(i))
                    })
                })

                callback(bundles, stats);

            })

        }
    }

    if (watch) {
        const watchOptions = {
            ignored: [join(getFromDecoupledConfig('appPath'), 'entries', '*.*')],
        };
        compiler.watch(watchOptions, compilerHandler as any);
    } else {
        compiler.run(compilerHandler as any);
    }

}
