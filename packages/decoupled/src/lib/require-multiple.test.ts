import path from 'path';
import { requireMultiple } from './require-multiple';

describe('requireMultiple()', () => {
    test('should return object with correct path', () => {
        const paths = [
            path.resolve('src/fixtures/test.js')
        ]
        const result = requireMultiple(paths);
        expect(typeof result).toBe('object');
    })
    test('should return undefined incorrect path', () => {
        const paths = [
            path.resolve('src/fixtures')
        ]
        const result = requireMultiple(paths);
        expect(result).toBe(undefined);
    })
})