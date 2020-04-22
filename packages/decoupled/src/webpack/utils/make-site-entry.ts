import { resolve, relative } from "path"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { appPath, srcDir } from "../../lib"
import { logger } from '../../logger';
import { checkRequire } from './check-require';
import { renderEntryTemplate } from "./entry-template";

export const makeSiteEntryForServer = (siteId: string) => {

    const entriesDir = resolve(appPath('entries'))

    if (!existsSync(entriesDir)) {
        mkdirSync(entriesDir, { recursive: true })
    }
    const entry = resolve(entriesDir, `${siteId}-entry.js`)

    if (existsSync(entry)) {
        return entry
    }

    const configDir = srcDir('sites', siteId, 'config')
    const viewsDir = srcDir('sites', siteId, 'server')

    const hasConfig = existsSync(resolve(configDir))
    const hasViews = checkRequire(resolve(viewsDir))

    if (!hasConfig) {
        logger.debug(`Exclude config from bundling, module does not exist: ${configDir}`)
    }

    if (!hasViews) {
        logger.debug(`Exclude views from bundling, module can not be required: ${configDir}`)
    }

    const output = renderEntryTemplate({
        tpl: {
            siteId,
            config: hasConfig ? relative(entriesDir, configDir) : null,
            views: hasViews ? relative(entriesDir, viewsDir) : null,
        }
    })

    writeFileSync(entry, output, { encoding: 'utf8' })

    return entry;

}

export const makeSiteEntryForBrowser = (siteId: string): string | undefined => {

    const browserEntry = srcDir('sites', siteId, 'browser')

    if (!checkRequire(resolve(browserEntry))) {
        logger.debug(`Exclude browser entry from bundling, module can not be required: ${browserEntry}`)
        return
    }
    logger.debug(`Add browser entry: ${browserEntry}`)

    return resolve(browserEntry);

}
