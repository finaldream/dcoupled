import { logger } from '../../logger';
import { isHash } from './hash';
import Chalk from 'chalk';
import { Compiler, MultiCompiler, compilation } from 'webpack';

export class DecoupledWebpackPlugin {

    static Plugin: string = 'DecoupledWebpackPlugin';

    applyHooks(compiler: Compiler) {
        try {
            compiler.hooks.compilation.tap(DecoupledWebpackPlugin.Plugin, (comp: any) => {

                logger.debug(Chalk.green(`Starting Compilation ${comp.name}`));
                logger.silly(() => [
                    'Compilation triggered by',
                    Object.keys((compiler as any).watchFileSystem.watcher.mtimes)
                ]);

                comp.hooks.afterHash.tap(DecoupledWebpackPlugin.Plugin, () => {

                    if (isHash(comp.name, comp.hash)) {
                        return;
                    }

                    logger.info(Chalk.yellow(`Compiling ${compiler.name} #${comp.hash}`));

                });
            });

            compiler.hooks.afterEmit.tap(DecoupledWebpackPlugin.Plugin, (comp: any) => {
                const keys = Object.keys(comp.assets)
                if (keys.length) {
                    logger.debug(Chalk.yellow(`${compiler.name} emitted:`))
                    keys.forEach(a => logger.debug(Chalk.yellow(a)))
                } else {
                    logger.debug(Chalk.yellow(`${compiler.name} emitted nothing`))
                }
            });

        } catch (e) {
            logger.error(e)
        }
    }

    apply(compiler: Compiler | MultiCompiler) {

        if (!compiler) {
            logger.error('Compiler is undefined')
            return
        }

        if (Array.isArray((compiler as MultiCompiler).compilers)) {
            (compiler as MultiCompiler).compilers.forEach(c => this.applyHooks(c));
            return
        }

        this.applyHooks(compiler as Compiler)

    }
}
