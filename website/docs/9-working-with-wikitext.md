# Working with wikitext

Mwn can be used for parsing wikitext:

```js
let wkt = new bot.wikitext('This is some wikitext with [[links]] and {{templates|with=params}}.');

wkt.parseTemplates(); // -> [Template {wikitext: '{{templates|with=params}}', parameters: [ Parameter {name: 'with', value: 'params', wikitext: '|with=params'}] ], name: 'Templates' }]

// This requires the bot object to have the namespace data of the wiki available.
// Either the bot should be logged in, or run bot.getSiteInfo()
wkt.parseLinks(); // populates wkt.links, wkt.files, wkt.categories
wkt.links; // -> [{ wikitext: '[[links]]', target: Title { namespace: 0, title: 'links', fragment: null }, displaytext: 'links'}]
```
