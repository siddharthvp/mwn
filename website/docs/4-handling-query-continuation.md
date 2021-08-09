# Handling query continuation

Mwn uses [asynchronous generators](https://javascript.info/async-iterators-generators), ([for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loops) to provide a very intuitive interface around MediaWiki API's [query continuation](https://www.mediawiki.org/wiki/API:Query#Example_4:_Continuing_queries).

Use `bot.continuedQueryGen` everytime you want to fetch more results than what the API gives you in one go (usually 5000 results). `continuedQueryGen` automatically uses the continue parameters in the response to create and send new requests that retrieve data from where the previous response was cut off.

The following example generates a list of all active users on the wiki (which may be more than 5000).

```js
var activeusers = [];
for await (let json of bot.continuedQueryGen({
	action: 'query',
	list: 'allusers',
	auactiveusers: 1,
	aulimit: 'max'
})) {
	let users = json.query.allusers.map((user) => user.name);
	activeusers = activeusers.concat(users);
}
```

Specialised derivatives exist to fulfill common needs:

-   `new bot.page('Page name').historyGen()` - fetch page history
-   `new bot.page('Page name').logsGen()` - fetch page logs
-   `new bot.category('Page name').membersGen()` - fetch category members
-   `new bot.user('User name').contribsGen()` - fetch user contributions
-   `new bot.user('User name').logsGen()` - fetch user logs

Every method with a name that ends in `Gen` is an async generator.
