interface $AnyObject {
    [key: string]: any;
}

export interface Site {

    /**
     * Site key
     */
    key: string;

    /**
     * Site domain
     */
    domain: string;

    /**
     * Site url
     */
    url: string;

    /**
     * Site directory
     */
    directory: string;

    /**
     * Site on/off
     */
    enabled: boolean;

    /**
     * Site display name
     */
    name: string;

}
