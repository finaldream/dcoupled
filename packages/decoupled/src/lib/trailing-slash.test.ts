import path from 'path';
import {
  isFilename,
  hasTrailingSlash,
  shouldFixTrailingSlash,
  fixTrailingSlash
} from './trailing-slash';

describe('isFilename()', () => {
    test('should return true with correct file name', () => {
        const fileUrl = path.resolve('src/fixtures/test.js');
        const result = isFilename(fileUrl);
        expect(result).toBe(true);
    })
    test('should return false with incorrect file name', () => {
        const fileUrl = path.resolve('src/fixtures/');
        const result = isFilename(fileUrl);
        expect(result).toBe(false);
    })
})

describe('hasTrailingSlash()', () => {
    test('should return true with url have slash trailing', () => {
        const fileUrl = '/test/';
        const result = hasTrailingSlash(fileUrl);
        expect(result).toBe(true);
    })
    test('should return false with url have not slash trailing', () => {
        const fileUrl = '/test';
        const result = hasTrailingSlash(fileUrl);
        expect(result).toBe(false);
    })
})

describe('shouldFixTrailingSlash()', () => {
    test('should return true with correct url', () => {
        const fileUrl = path.resolve('src/fixtures/');
        const result = shouldFixTrailingSlash(fileUrl);
        expect(result).toBe(true);
    })
    test('should return false with incorrect url', () => {
        const fileUrl = 'test/';
        const result = shouldFixTrailingSlash(fileUrl);
        expect(result).toBe(false);
    })
})

describe('fixTrailingSlash()', () => {
    test('should return origin url with trailing slash', () => {
        const fileUrl = '/test/';
        const result = fixTrailingSlash(fileUrl);
        expect(result).toEqual(fileUrl);
    })
    test('should return fix url with no trailing slash', () => {
        const fileUrl = '/test';
        const result = fixTrailingSlash(fileUrl);
        expect(result).toEqual('/test/');
    })
})