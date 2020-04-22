import { resolve } from 'path';

/*
TODO: get a better concept of src, dest, app paths
*/

/**
 * Gets a path based on the specified site
 * @param siteId site the path is based on
 * @param subPaths additional sub-paths.
 */
export const getSitePath = (siteId: string, ...subPaths: string[]): string => (
    resolve('src', 'sites', siteId, ...subPaths)
);
