import { appPath } from './app-path';

describe('appPath()', () => {
    test('should return default path with no basePath', () => {
        const result = appPath();
        expect(result).toEqual('./');
    })
    test('should return new path with basePath', () => {
        const result = appPath('/test');
        expect(result).toEqual('test');
    })
})