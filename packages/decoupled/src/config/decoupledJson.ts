import { resolve } from 'path';
import { get } from 'lodash';

let decoupledJson: object = null;

function loadDecoupledJson(rootPath?: string) {

    if (decoupledJson) {
        return decoupledJson;
    }

    try {
        decoupledJson = require(resolve(rootPath || '', 'decoupled.json'));
    } catch (e) {
        decoupledJson = null;
    }

    return decoupledJson || {};

}

export const hasDecoupledJson = (rootPath?: string): boolean => {

    loadDecoupledJson(rootPath);
    return decoupledJson !== null;

};

export const getFromDecoupledJson = (keyPath: string, defaultValue: any = null): any => {

    return get(
        loadDecoupledJson(),
        keyPath,
        defaultValue,
    );

};
