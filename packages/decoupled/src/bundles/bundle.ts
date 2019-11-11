import { logger } from "../logger";

export interface BundleContent {
    siteId: string
    config: __WebpackModuleApi.RequireContext
    views: AnyObject
}

export class Bundle {

    private content: BundleContent
    private _filename: string;
    public loaded: boolean = false;
    public readonly siteId: string;

    public get filename() {
        return this._filename;
    }

    public set filename(filename: string) {
        this._filename = filename;
    }

    constructor(siteId: string, file: string) {

        this.siteId = siteId
        this.filename = file;

    }

    load() {
        try {
            this.content = require(this.filename).default;
            this.loaded = true
            logger.debug(`Loaded bundle from ${this.filename}`)
        } catch (e) {
            logger.error(`Error loading bundle "${this.filename}": ${e.message}`);
        }

        if (this.siteId !== this.content.siteId) {
            logger.error(`Bundle.loadBundle: SiteId mismatch. Expected "${this.siteId}", got "${this.content.siteId}"`)
        }

    }

    get config(): __WebpackModuleApi.RequireContext {
        return this.content.config
    }

    get views(): AnyObject {
        return this.content.views
    }
}
