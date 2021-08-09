# Other basic operations

Read the contents of a page:

```js
await bot.read('Page title');
```

Read a page along with metadata:

```js
await bot.read('Page title', {
	rvprop: ['content', 'timestamp', 'user', 'comment']
});
```

Read multiple pages using a single API call:

```js
bot.read(['Page 1', 'Page 2', 'Page 3']).then((pages) => {
	// pages[0], pages[1], pages[2]
});
```

Delete a page:

```js
await bot.delete('Page title', 'deletion log summary', additionalOptions);
```

Move a page along with its subpages:

```js
await bot.move('Old page title', 'New page title', 'move summary', {
	movesubpages: true,
	movetalk: true
});
```

Parse wikitext (see [API:Parse](https://www.mediawiki.org/wiki/API:Parsing_wikitext) for additionalOptions)

```js
await bot.parseWikitext('Input wikitext', additonalOptions);
```

Parse the contents of a given page

```js
await bot.parseTitle('Page name', additionalOptions);
```

Upload a file from your system to the wiki:

```js
await bot.upload('File title', '/path/to/file', 'comment', customParams);
```

Download a file from the wiki:

```js
await bot.download('File:File name.jpg', 'Downloaded file name.jpg'); // 2nd param defaults to the on-wiki name if unspecified
```

Creating a page object opens up further possibilities:

```js
let page = new bot.page('Main Page');
```

See [list of methods available on page object](https://mwn.toolforge.org/docs/api/interfaces/mwnpage.html).

[Files](https://mwn.toolforge.org/docs/api/interfaces/mwnfile.html) and [categories](https://mwn.toolforge.org/docs/api/interfaces/mwncategory.html) have their own subclasses that add a few additional methods.


