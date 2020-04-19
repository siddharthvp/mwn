# mwn

**mwn** is a modern MediaWiki bot framework in NodeJS, orginally adapted from [mwbot](https://github.com/Fannon/mwbot).

Development status: **Unstable**

### Setup

Until mwn is released on npm, enter the `node_modules` directory of your project and run:
```sh
git clone https://github.com/siddharthvp/mwn.git
cd mwn
npm install		# install dependencies
```

#### mwn uses JSON with formatversion 2 by default; formatversion 2 is an [improved JSON output format](https://www.mediawiki.org/wiki/API:JSON_version_2#Using_the_new_JSON_results_format) introduced in MediaWiki in 2015.


#### Node version
mwn is written with Node.js 13 in hand. While everything may still work in older versions of Node, you can consider upgrading to Node.js 13. If your bot is hosted on [Toolforge](https://tools.wmflabs.org/), you can install the latest node.js in your home directory, using:
```sh
npm install npm@latest     # update npm first to the latest version
npm install n
export N_PREFIX=~
./node_modules/n/bin/n latest
export PATH=~/bin:$PATH
```
Check that your `.profile` or `.bashrc` file includes the line `PATH="$HOME/bin:$PATH"`, so that the path includes your home directory every time you open the shell.

#### Set up a bot password

To be able to login to the wiki, you have to set up a bot password using the wiki's [Special:BotPasswords](https://en.wikipedia.org/wiki/Special:BotPasswords) page.

If you're migrating from mwbot, note that:
- `edit` in mwbot is different from `edit` in mwn. You want to use `save` instead.
- If you were using the default formatversion=1 output format, set formatversion: 1 in the config options.

### Documentation

Create a new bot instance:
```js
const bot = new mwn();
```

Log in to the bot:
```js
bot.login({
	apiUrl: 'https://en.wikipedia.org/w/api.php',
	username: 'YourBotUsername',
	password: 'YourBotPassword'
});
```

Set default parameters to be sent to be included in every API request:
```js
bot.setDefaultParams({
	assert: 'bot',
	maxlag: 4 // mwn default is 5
});
```

Set bot options. The default values for each is specified below:
```js
bot.setOptions({
	silent: false, // suppress messages (except error messages)
	maxlagPause: 5000, // pause for 5000 milliseconds (5 seconds) on maxlag error.
	maxlagMaxRetries: 3, // attempt to retry a request failing due to maxlag upto 3 times
	apiUrl: null // set the API URL, can also be set by a bot.setApiUrl
});
```

**Maxlag**: The default [maxlag parameter](https://www.mediawiki.org/wiki/Manual:Maxlag_parameter) used by mwn is 5 seconds. Requests failing due to maxlag will be automatically retried after pausing for a duration specified by `maxlagPause` (default 5 seconds). A maximum of `maxlagMaxRetries` will take place (default 3).

Fetch an CSRF token required for most write operations.
```js
bot.getCsrfToken();
```
The token, once obtained is stored in the bot state so that it can be reused any number of times.

If an action fails due to an expired or missing token, the action will be automatically retried after fetching a new token.

For convenience, you can log in and get the edit token together as:
```js
bot.loginGetToken();
```
If your bot doesn't need to log in, you can simply set the API url using:
```js
bot.setApiUrl('https://en.wikipedia.org/w/api.php');
```

Set your user agent (required for [WMF wikis](https://meta.wikimedia.org/wiki/User-Agent_policy)):
```js
bot.setUserAgent('myCoolToolName v1.0 ([[w:en:User:Example]])/mwn');
```

Edit a page. Edit conflicts are raised as errors.
```js
bot.edit('Page title', rev => {
	// rev.content gives the revision text
	// rev.timestamp gives the revision timestamp

	var text = rev.content.replace(/foo/g, 'bar');

	return {  // return parameters needed for [[mw:API:Edit]]
		text: text,
		summary: 'replacing foo with bar',
		minor: true
	};

});
```

Save a page with the given content without loading it first. Simpler verion of `edit`. Does not offer any edit conflict detection.
```js
bot.save('Page title', 'Page content', 'Edit summary');
```
Create a new page.
```js
bot.create('Page title', 'Page content', 'Edit summary');
```

Post a new section to a talk page:
```js
bot.newSection('Page title', 'New section header', 'Section content', additionalOptions);
```

Read the contents of a page:
```js
bot.read('Page title');
```

Read a page along with metadata:
```js
bot.read('Page title', {
	rvprop: ['content', 'timestamp', 'user', 'comment']
});
```

Read multiple pages using a single API call:
```js
bot.read(['Page 1', 'Page 2', 'Page 3']).then(pages => {
	// pages[0], pages[1], pages[2]
});
```

Delete a page:
```js
bot.delete('Page title', 'deletion log summary', additionalOptions);
```

Restore all deleted versions:
```js
bot.undelete('Page title', 'log summary', additionalOptions);
```

Move a page along with its subpages:
```js
bot.move('Old page title', 'New page title', 'move summary', {
	movesubpages: true,
	movetalk: true
});
```

Parse wikitext (see [API:Parse](https://www.mediawiki.org/wiki/API:Parsing_wikitext) for additionalOptions)
```js
bot.parseWikitext('Input wikitext', additonalOptions);
```

Parse the contents of a given page
```js
bot.parseTitle('Page name', additionalOptions);
```

Rollback a user:
```js
bot.rollback('Page title', 'user', additionalOptions);
```

Upload a file from your system to the wiki:
```js
bot.upload('File title', '/path/to/file', 'comment', customParams);
```

#### Direct calls

#### request(query)
Directly query the API. See [mw:API](https://www.mediawiki.org/wiki/API:Main_page) for options. You can create and test your queries in the [API sandbox](https://www.mediawiki.org/wiki/Special:ApiSandbox).
Example: get all images used on the article Foo
```js
bot.request({
	"action": "query",
	"prop": "images",
	"titles": "Foo"
}).then(data => {
	return data.query.pages[0].images.map(im => im.title);
});
```

#### Bulk processing methods

##### continuedQuery(query, maxCallsLimit)
Send an API query, and continue re-sending it with the continue parameters received in the response, until there are no more results (or till `maxCalls` limit is reached). The return value is a promise resolved with the array of responses to individual API calls.
```js
bot.continousQuery(apiQueryObject, maxCalls=10)
```

Example: get a list of all active users on the wiki using `continuedQuery` (using [API:Allusers](https://www.mediawiki.org/wiki/API:Allusers)):
```js
bot.continuedQuery({
	"action": "query",
	"list": "allusers",
	"auactiveusers": 1,
	"aulimit": "max"
}, 40).then(jsons => {
	return jsons.reduce((activeusers, json) => {
		return activeusers.concat(json.query.allusers.map(user => user.name));
	}, []);
});
```

##### massQuery(query, nameOfBatchField, hasApiHighLimit)
MediaWiki sets a limit of 500 (50 for non-bots) on the number of pages that can be queried in a single API call. To query more than that, the `massQuery` function can be used, which splits the page list into batches of 500 and sends individual queries and returns a promise resolved with the array of all individual API call responses.

Example: get the protection status of a large number of pages:
```js
bot.massQuery({
	"action": "query",
	"format": "json",
	"prop": "info",
	"titles": ['Page1', 'Page2', ... , 'Page1300'],  // array of page names
	"inprop": "protection"
}) // 2nd parameter is taken as 'titles' by default
.then(jsons => {
	// jsons is the array of individual JSON responses.
});
```
The 3rd parameter `hasApiHighLimit` is set `true` by default. If you get the API error 'toomanyvalues' (or similar), your account doesn't have the required user right, so set the parameter as `false`.

Any errors in the individual API calls will not cause the entire massQuery to fail, but the data at the array index corresponding to that API call will be error object.

##### batchOperation(pageList, workerFunction, concurrency)
Perform asynchronous tasks (involving API usage) over a number of pages (or other arbitrary items). `batchOperation` uses a default concurrency of 5. Customise this according to how expensive the API operation is. Higher concurrency limits could lead to more frequent API errors.

The `workerFunction` must return a promise.
```js
bot.batchOperation(pageList, (page, idx) => {
	// do something with each page
	// the index of the page in pageList is available as the 2nd argument

	// return a promise in the end
}, 5); // set the concurrency as the third parameter.
```

##### seriesBatchOperation(pageList, workerFunction, sleepDuration)
Perform asynchronous tasks (involving API usage) over a number of pages one after the other, with a sleep duration between each task (default 5 seconds)

The `workerFunction` must return a promise.
```js
bot.seriesBatchOperation(pageList, (page, idx) => {
	// do something with each page
	// the index of the page in pageList is available as the 2nd argument

	// return a promise in the end
}, 5000); // set the sleep duration in milliseconds as the third parameter
```
Note that `seriesBatchOperation` with delay=0 is same as `batchOperation` with concurrency=1.