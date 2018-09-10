import path from 'path';
import {
  hasDecoupledJson,
  getFromDecoupledJson
} from './decoupledJson';

describe('hasDecoupledJson()', () => {
    test('should return false if decoupled.json is not exist', () => {
        expect(hasDecoupledJson()).toBe(false);
    });
    test('should return true if decoupled.json is exist', () => {
        const rootPath = path.resolve('src/fixtures/')
        expect(hasDecoupledJson(rootPath)).toBe(true);
    });
});

describe('getFromDecoupledJson()', () => {
    test('should return appPath value', () => {
        const result = getFromDecoupledJson('appPath', './');
        expect(result).toBe('app');
    })
})