import ejs from 'ejs';
import { readFileSync } from "fs"

let entryTemplate = null

export const cacheEntryTemplate = (path: string): any => {
    const template = readFileSync(path, { encoding: 'utf8' }) as string;
    entryTemplate = ejs.compile(template);
}

export const renderEntryTemplate = (props: any) => entryTemplate && entryTemplate(props)
