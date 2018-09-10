import { genAPICacheKey } from './gen-api-cache-key';

describe('genAPICacheKey()', () => {
    test('should return a buffer with no params variable', () => {
        const result = genAPICacheKey('test');
        expect(result.trim() !== '').toBe(true);
    })
    test('should return a buffer with params variable', () => {
        const result = genAPICacheKey('test', { title: 'a' });
        expect(result.trim() !== '').toBe(true);
    })
})