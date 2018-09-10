import { getRealSlug } from './get-real-slug';

describe('getRealSlug()', () => {
    test('should return valid slug with no type', () => {
        const slug = 'test-slug';
        const result = getRealSlug(slug);
        expect(result).toEqual(slug);
    })
    test('should return valid slug with type', () => {
        const slug = 'test-slug';
        const result = getRealSlug(slug, ['slug']);
        expect(result).toEqual('test');
    })
})