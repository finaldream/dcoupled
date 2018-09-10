import path from 'path';
import requireJSON from './require-json';

describe('requireJSON', () => {
    test('should return object with correct json file', () => {
        const testPath = path.resolve('src/fixtures/test-valid-json.txt');
        const result = requireJSON(testPath);
        expect(typeof result).toBe('object');
    })
    test('should return null with incorrect json file', () => {
        const testPath = path.resolve('src/fixtures/test-invalid-json.txt');
        const result = requireJSON(testPath);
        expect(result).toBe(null);
    })
    test('should return null with incorrect path', () => {
        const testPath = path.resolve('src/fixtures/something');
        const result = requireJSON(testPath);
        expect(result).toBe(null);
    })
})