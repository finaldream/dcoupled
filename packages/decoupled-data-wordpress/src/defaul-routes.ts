
import { handleCacheInvalidate, handleMenus, handlePreviewRequest, handleRouteWithSlug } from './handlers';

export const decoupledWordpressDefaultRoutes = [

    {
        handler: [handleMenus, handlePreviewRequest],
        method: 'GET',
        route: '/preview(/)',
    },
    {
        handler: handleCacheInvalidate,
        method: 'POST',
        route: '/cache(/)',
        docType: '',
        render: (site, { state }) => JSON.stringify(state),
    },
    {
        handler: [handleMenus, handleRouteWithSlug],
        method: 'GET',
        route: '(*)',
    }
    
];
