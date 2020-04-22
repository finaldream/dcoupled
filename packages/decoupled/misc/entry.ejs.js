/*
    This is a JS file, preproccessed by the EJS template engine
*/

/**
* Generic Webpack entry for sites.
*/

let views = null;
let config = null;

<% if (tpl.views) { %>
    try {
        views = require('<%= tpl.views %>')
    } catch (e) {
        console.log(`${e.essage}`)
    }
<% } %>

<% if (tpl.config) { %>
    config = require.context('<%= tpl.config %>', true, /\.(tsx?|jsx?)$/);
<% } %>


export default {
    siteId: '<%= tpl.siteId %>',
    config,
    views,
}
