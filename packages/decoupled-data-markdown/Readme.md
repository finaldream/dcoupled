# decoupled-data-markdown

Markdown with YAML data-source for decoupled and general usage.

Parses Markdown into HTML and supports full-featured YAML frontmatter.

## Features

* load markdown-docs by slug
* parse markdown with [Showdown](http://showdownjs.com/)
* parse YAML-frontmatter with [YAML](https://eemeli.org/yaml/)
* custom `!!md` YAML-tag for additional markdown fields in front-matter

## Use-cases

* simple document-based websites or blogs
* metadata support for posts
* complex data-structures for enriching pages
* use frontmatter for complex page-builder structures 

## Usage

In `config/SITE/router.js` use:

```js
import { decoupledMarkdownHandler } from 'decoupled-data-markdown';

module.exports.router = {
    routes: [
        {
            method: 'GET',
            route: '(.*)',
            handler: decoupledMarkdownHandler,
        },
    ]
};
```
