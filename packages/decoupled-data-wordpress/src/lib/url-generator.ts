
import qs from 'qs';

export const urlGenerator = (url: string, type: string, params = {}, ): string => {

    let result = `${url.replace(/\/$/, '')}/${type}/`;

    if (params) {
        result = `${result}?${qs.stringify(params)}`;
    }

    return result;
}
