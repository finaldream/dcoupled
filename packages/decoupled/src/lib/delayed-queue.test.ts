import { DelayedQueue } from './delayed-queue';

describe('class DelayedQueue', () => {
    test('should return when Initial success', () => {
        const result = new DelayedQueue(100, () => {});
        expect(Object.keys(result).includes('timeout')).toBe(true);
    })
    test('timeoutId prototype should exist when call push method', () => {
        const result = new DelayedQueue(100, () => {});
        result.push(['a', 'b']);
        expect(Object.keys(result).includes('timeoutId')).toBe(true);
    })
    test('should items array when call trigger method', () => {
        const result = new DelayedQueue(100, (items) => {
            expect(items.includes('a')).toBe(true);
        });
        result.push(['a', 'b']);
        result.trigger();
    })
})