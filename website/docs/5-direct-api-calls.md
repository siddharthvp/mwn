# Direct API calls

The `request` method directly queries the API. See [mw:API](https://www.mediawiki.org/wiki/API:Main_page) for options.

You can create and test your queries in [Special:ApiSandbox](https://www.mediawiki.org/wiki/Special:ApiSandbox). However, note that ApiSandbox uses json formatversion=1 by default whereas Mwn defaults to formatversion=2. So you should set formatversion: 2 in the format=json options, otherwise the output can be formatted differently for certain API endpoints. Use of the legacy formatversion is not recommended.

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

Mwn provides a great number of convenience methods so that you can avoid writing raw API calls, see the earlier sections.

#### Raw web requests

Mwn also exposes the lower level [`rawRequest`](https://mwn.toolforge.org/docs/api/classes/Mwn.html#rawrequest) method using which you can make requests to any web API. Its format is based on axios.

```js
let response = await bot.rawRequest({
	method: 'get',
	url: 'https://wikimedia.org',
	params: {
		param1: 'value1'
	},
	responseType: 'json',
});
```
