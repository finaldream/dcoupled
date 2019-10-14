import qs from 'qs';

/**
 * Generate API cache key
 * @param {String} type
 * @param {Object} params
 * @return {String}
 */
export function genAPICacheKey(type, params = {}) {
    const plain = `${type}/${qs.stringify(params, { encode: false })}`;

    return new Buffer(plain).toString('base64');
}
