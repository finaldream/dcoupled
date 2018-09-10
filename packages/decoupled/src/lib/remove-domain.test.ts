import { removeDomain } from './remove-domain';

describe('removeDomain()', () => {
    test('should return replaced content with correct domain', () => {
        const url = 'drive.google.com';
        const content = `this is test https://www.drive.google.com`
        const result = removeDomain(content, url);
        expect(result).toEqual('this is test ');
    })
    test('should return content incorrect domain', () => {
        const url = 'finaldream.de';
        const content = `this is test https://www.drive.google.com`
        const result = removeDomain(content, url);
        expect(result).toEqual(content);
    })
})