import { join } from 'path';
import { getFromDecoupledConfig } from '../config';

let basePath: string;

export const srcDir = (...paths: string[]): string => {

    if (!basePath) {
        basePath = getFromDecoupledConfig('srcDir');
    }

    return join(basePath, ...paths);

};
