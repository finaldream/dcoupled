import { isAbsoluteUrl } from './is-absolute-url';

describe('isAbsoluteUrl()', () => {
    test('should return true with correct AbsoluteUrl', () => {
        const url = 'https://www.google.com.vn/';
        const result = isAbsoluteUrl(url);
        expect(result).toBe(true);
    })
    test('should return true with correct AbsoluteUrl', () => {
        const url = 'google.com.vn';
        const result = isAbsoluteUrl(url);
        expect(result).toBe(false)
    })
})
