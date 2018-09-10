import { removeTrailingSlash } from './remove-trailing-slash';

describe('removeTrailingSlash()', () => {
    test('should return replaced content with correct path', () => {
        const path = '/test/';
        const result = removeTrailingSlash(path);
        expect(result).toEqual('/test');
    })
    test('should return path if path only /', () => {
        const path = '/';
        const result = removeTrailingSlash(path);
        expect(result).toEqual('/');
    })
})