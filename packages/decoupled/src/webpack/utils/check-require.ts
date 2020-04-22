export const checkRequire = (file: string): boolean => {

    try {
        require.resolve(file)
    } catch (e) {
        return false
    }

    return true

}
