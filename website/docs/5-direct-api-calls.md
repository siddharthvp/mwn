# Direct API calls

The `request` method is for directly querying the API. See [mw:API](https://www.mediawiki.org/wiki/API:Main_page) for options. You can create and test your queries in [Special:ApiSandbox](https://www.mediawiki.org/wiki/Special:ApiSandbox). Be sure to set formatversion: 2 in the options for format=json!

Example: get all images used on the article Foo

```js
bot.request({
	action: 'query',
	prop: 'images',
	titles: 'Foo'
}).then((data) => {
	return data.query.pages[0].images.map((im) => im.title);
});
```

Mwn provides a great number of convenience methods so that you can avoid writing raw API calls, see the sections below.
