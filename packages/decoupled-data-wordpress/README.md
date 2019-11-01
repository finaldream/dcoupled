# decoupled-data-wordpress

Wordpress API data-source for [decoupled](../decoupled/README.md).

Fetch data from WordPress RESTful API

Fine tuned to consume RESTful API from a WordPress instance using [wordpress-decoupled-support](https://github.com/finaldream/wordpress-decoupled-support)

## Features

- Configurable via [decoupled](../decoupled/README.md) config files.
- Simplify the use of fetch methods in your custom code for a decoupled based site.
- Supports cached fetch calls via decoupled's cache interfaces. 
- Provides default routes for your decoupled config files.
- Provides handlers for your routes, in case you need to use your own custom routes.

## Use-cases

* Connect a [decoupled](../decoupled/README.md) based site to a WordPress instance as data source.

## Usage

1- Add the package to your site using `yarn add decoupled-data-wordpress`

2- In `config/services.js` be sure to define the `wpapi.endpoint` key:

```js
wpapi: {
    endpoint: 'https://example.local/wp-json/wp/v2',
}
```

Additionaly, if you define `wpapi.authentication`, it will be used by this package

```js
wpapi: {
    endpoint: 'https://example.local/wp-json/wp/v2',
    authentication: {
            method: 'token',
            token: `SECRET`,
            username: `SECRET`,
            password: `SECRET`,
    },
}
```

3- In `config/router.js` import the handlers and assign them to a route:

```js

import {
  handleCacheInvalidate, 
  handleMenus, 
  handlePreviewRequest, 
  handleRouteWithSlug } from 'decoupled-data-wordpress';

module.exports.router = {
    routes: [        
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
    ]
};
```

The above are the default routes that are also provided with this package. You can simple use:

```js

import { 
  decoupledWordpressDefaultRoutes,
  handleCacheInvalidate, 
  handleMenus, 
  handlePreviewRequest, 
  handleRouteWithSlug } from 'decoupled-data-wordpress';

module.exports.router = {
    routes: [        
        ...decoupledWordpressDefaultRoutes
    ]
};
```

4- If you need to consume the WordPress data source from other components of your code (for example, from defined Tasks), you migth include the fetchs methods:

```js

import { cachedFetch, directFetch } from 'decoupled-data-wordpress';

export const taskFetchSitemaps = async (site) => {

    const type = 'list';
    const params = {
        lang: 'all',
    };

    const result = await directFetch(site, {
        type,
        params
    });
};
```


