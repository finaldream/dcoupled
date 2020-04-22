let hashes = new Map<string, string>();

export const getHash = (key: string): string => hashes.get(key)
export const isHash = (key: string, value: string): boolean => getHash(key) === value

export const setHash = (key: string, value: string) => {
    hashes.set(key, value);
}
