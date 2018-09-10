import { getHostUrl } from './get-host-url';

describe('getHostUrl()', () => {
    test('should return vaild url with complete request', () => {
        const request = {
            headers: {
                'x-forwarded-host': 'ken.finaldream.de'
            },
            host: 'finaldream.de',
            connection: 'keep-alive'
        }
        const result = getHostUrl(request);
        expect(result).toEqual('http://ken.finaldream.de');
    })
    test('should return empty string with missing request', () => {
        const request = {}
        const result = getHostUrl(request);
        expect(result.length).toBe(0);
    })
})