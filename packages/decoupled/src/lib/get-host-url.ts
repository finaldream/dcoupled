
export function getHostName(request, stripPort: boolean = false) {

    if (!request || !request.headers) {
        return '';
    }

    const headers = request.headers;
    const host: string = headers['x-forwarded-host']
        ? headers['x-forwarded-host']
        : request.get('host') || request.hostname || '';

    if (stripPort && host.indexOf(':') !== -1) {
        return host.split(':').shift();
    }

    return host;

}

/**
 * Retrieves the host-url from the provided request.
 */

export function getHostUrl(request) {

    if (!request || !request.headers || !request.connection) {
        return '';
    }

    const headers = request.headers;
    const host = getHostName(request);
    const protocol = headers['cloudfront-forwarded-proto']
        || headers['x-forwarded-proto'] || request.protocol || 'http';

    return `${protocol}://${host}`;

}
