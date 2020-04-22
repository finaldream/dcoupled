import { Bundle } from "./bundle";
import { logger } from "../logger";
import { join, relative } from "path";
import { compile } from "../webpack/compiler";
import { EventEmitter } from "events";
import { stripCwd } from "../lib/strip-cwd";

export type BundleManagerMode = 'load' | 'build' | 'watch'

export interface BundleFileInfo {
    id: string
    file: string
}

export class BundleManager extends EventEmitter {

    public static BUNDLES_LOADED = 'bundles-loaded'

    private bundles = new Map<string, Bundle>();
    public bundleDirectory: string = './';
    public mode: BundleManagerMode = 'load';


    /**
     * Add bundle-ids
     * @param ids without .js extension
     */
    addBundles(ids: string[] = []) {

        ids.forEach(id => {
            if (this.bundles.has(id)) {
                logger.error(`BundleManager: Id "${id}" already exists!`);
                return;
            }

            const file = join(this.bundleDirectory, `${id}.js`)
            logger.debug(`BundleManager: Add ${id} from ${stripCwd(file)}`);

            const bundle = new Bundle(id, file)
            this.bundles.set(id, bundle)

        })

    }

    public getBundle(id: string): Bundle | null {
        return this.bundles.has(id)
            ? this.bundles.get(id)
            : null;
    }

    public process() {

        logger.info('Processing bundles in mode', this.mode)

        switch (this.mode) {
            case 'load':
                this.loadBundles();
                break;
            case 'watch':
                this.watchBundles();
                break;
            case 'build':
            default:
                this.buildBundles();
                break;
        }

    }

    private updateBundleInfo(infos: BundleFileInfo[]) {

        logger.debug(() => ['Update Bundle Info', infos.map(i => `${i.id}: ${i.file}`)])

        infos.forEach(info => {
            const bundle = this.bundles.get(info.id);
            if (!bundle) {
                logger.error(`bundle ${info.id} not found`)
            }
            bundle.filename = join(this.bundleDirectory, info.file);
        });

    }

    /**
     * Load bundles, assume bundles exist
     */
    private loadBundles() {

        logger.info('Loading bundles from files')
        this.bundles.forEach(bundle => {
            bundle.load()
        })

        this.emit(BundleManager.BUNDLES_LOADED);
    }

    private buildBundles() {

        logger.info('Building bundles')

        compile(
            (bundleInfos) => {
                this.updateBundleInfo(bundleInfos)
                this.loadBundles();
            },
            false,
        )

    }

    private watchBundles() {

        logger.info('Watching files')

        compile(
            (bundleInfos) => {
                this.updateBundleInfo(bundleInfos)
                this.loadBundles();
            },
            true,
        )

    }

}

export const defaultBundleManager = new BundleManager();
