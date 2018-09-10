import path from 'path';
import { getSiteIDs } from './get-site-ids';

describe('getSiteIds()', () => {
  test('expect correct rootPath return example value', () => {
    const rootPath = path.resolve('src/fixtures/config/');
    const siteIds = getSiteIDs(rootPath);
    expect(siteIds.includes('example')).toBe(true);
  })
  test('expect wrong rootPath throw error', () => {
    const rootPath = path.resolve('src/fixtures/something/');
    try {
      getSiteIDs(rootPath);
    } catch (error) {
      expect(error.toString()).toMatch(/no such file or directory/ig);
    }
  })
})