/**
 * Tries to multiple module-locations in order to require the first valid one.
 *
 * @param {String[]||String} paths String or Array of Strings pointing to possible module-locations.
 * @return {*|undefined} The first valid module or undefined if none was found.
 */
export function requireMultiple(paths) {
    const p = Array.isArray(paths) ? paths : [paths];
    let result;

    p.some((value) => {
        try {
            result = require(value); // eslint-disable-line
            return true;
        } catch (e) {
            // no-op
        }
        return false;
    });
    
    return result;
}
