import { join } from 'path';
import { getFromDecoupledConfig } from '../config';

let basePath: string;

export const appPath = (...paths: string[]): string => {

    if (!basePath) {
        basePath = getFromDecoupledConfig('appPath');
    }

    return join(basePath, ...paths);

};
