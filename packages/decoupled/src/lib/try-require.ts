export const tryRequire = (path: string, defaultValue?: any): any => {

    let result = defaultValue

    try {
        result = require(path)
    } catch (e) {
        //no-op
    }

    return result
}
