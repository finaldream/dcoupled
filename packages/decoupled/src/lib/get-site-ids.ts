import fs from 'fs';
import path from 'path';

export function getSiteIDs(rootPath: string = './', includeDefault: boolean = false): string[] {
    return fs.readdirSync(rootPath)
        .filter((file) => {
            if (!includeDefault && file === 'default') { return false; }
            return fs.lstatSync(path.join(rootPath, file)).isDirectory();
        });
}
