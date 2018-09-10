import { validateHttpMethod } from './validate-http-method';

describe('validateHttpMethod()', () => {
    test('should return nothing with correct method ', () => {
        const result = validateHttpMethod('post'); 
        expect(result).toBe(undefined);
    })
    test('should throw erro with incorrect method ', () => {
        try {
            validateHttpMethod('test')
        } catch (error) {
            expect(error.toString()).toMatch(/Unsupported HTTP method/ig);
        }
    })
})