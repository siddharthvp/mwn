# Working with wikitext

Mwn can be used for common wikitext parsing needs, though there is no AST-based parsing.

Create object for further operations:

```js
let wkt = new bot.Wikitext('This is some wikitext with [[links]] and {{templates|with=params}}.');
```

Parse links:

```js
// This requires the bot object to have the namespace data of the wiki available.
// Either the bot should be logged in, or run bot.getSiteInfo()
wkt.parseLinks(); // populates wkt.links, wkt.files, wkt.categories

wkt.links // -> [{ wikitext: '[[links]]', target: Title { namespace: 0, title: 'links', fragment: null }, displaytext: 'links'}]
wkt.categores // -> []
wkt.files // => []
```

Parse templates:

```js
wkt.parseTemplates() // -> [Template {wikitext: '{{templates|with=params}}', parameters: [ Parameter {name: 'with', value: 'params', wikitext: '|with=params'}] ], name: 'Templates' }]
```

`parseTemplates` can optionally take a [TemplateConfig](https://mwn.toolforge.org/docs/api/interfaces/TemplateConfig.html) object as argument.

It can also be used without constructing a bot.Wikitext object, as:

```js
bot.Wikitext.parseTemplates()
```

Parse simple tables:

```js
const parsedTable = bot.Wikitext.parseTable(`
{| class="wikitable sortable"
|-
! Header1 !! Header2 !! Header3
|-
| A || B || C
| -
| D || E || F
|}
`);
```

The result is an array of plain JS objects, each having the table headers as keys.
