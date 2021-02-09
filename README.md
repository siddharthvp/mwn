# mwn
![Node.js CI](https://github.com/siddharthvp/mwn/workflows/Node.js%20CI/badge.svg)
![CodeQL](https://github.com/siddharthvp/mwn/workflows/CodeQL/badge.svg)
[![NPM version](https://img.shields.io/npm/v/mwn.svg)](https://www.npmjs.com/package/mwn)
[![Coverage Status](https://coveralls.io/repos/github/siddharthvp/mwn/badge.svg?branch=master)](https://coveralls.io/github/siddharthvp/mwn?branch=master)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Mwn** is a modern and comprehensive MediaWiki bot framework for Node.js, originally adapted from [mwbot](https://github.com/Fannon/mwbot).

Mwn works with both JavaScript and TypeScript. It is created with a design philosophy of allowing bot developers to easily and quickly write bot code, without having to deal with the MediaWiki API complications and idiosyncrasies such as logins, tokens, maxlag, query continuations and error handling. Making raw API calls is also supported for complete flexibility where needed. The [axios](https://www.npmjs.com/package/axios) library is used for HTTP requests.

Mwn uses promises, which you can use with async–await. To handle query continuations, mwn uses asynchronous generators. All methods with names ending in `Gen` are generators.

Mwn uses [JSON with formatversion 2](https://www.mediawiki.org/wiki/API:JSON_version_2#Using_the_new_JSON_results_format) by default. Use of the legacy formatversion is not recommended. Note that [Special:ApiSandbox](https://en.wikipedia.org/wiki/Special:ApiSandbox) uses formatversion=1 by default, so if you're testing API calls using ApiSandbox be sure to set the correct formatversion there, otherwise the output will be formatted differently.

Versioning: while mwn is in version 0, changes may be made to the public interface with a change in the minor version number.

Complete API documentation is available **[here](https://tools-static.wmflabs.org/mwn/docs/classes/_bot_.mwn.html)** ([alternative link](https://mwn.toolforge.org/docs/classes/_bot_.mwn.html)). In addition to the MediaWiki Action API, the library also provides methods to talk to the Wikimedia EventStreams API, the ORES API and WikiWho API.  

Amongst the major highlights are `batchOperation` and `seriesBatchOperation` which allow you run a large number of tasks with control over concurrency and sleep time between tasks. Failing actions are automatically retried. 

This library uses mocha for tests and has extensive test coverage covering all commonly used code paths. Testing is automated using a CI workflow on Github Actions.

### Setup

To install, run `npm install mwn`.

[![Download stats](https://nodei.co/npm/mwn.png?downloads=true&downloadRank=true)](https://nodei.co/npm/mwn/)

Or obtain the latest development copy:
```sh
git clone https://github.com/siddharthvp/mwn.git
cd mwn
npm install		# install dependencies
npm run build   # generate JS files from TS
```

#### Node.js compatibility
Mwn is written in TypeScript v4. The repository contains JavaScript files compiled to CommonJS module system for ES2018 target, which corresponds to Node 10.x. 

If your bot is hosted on [Toolforge](https://tools.wmflabs.org/), note that the system version of node there is v8.11.1. You can install a more recent version of node to your home directory, using:
```sh
npm install npm@latest		# update npm first to the latest version
npm install n				# install a node package manager
export N_PREFIX=~
./node_modules/n/bin/n lts	# get the latest LTS version of node
export PATH=~/bin:$PATH
```

Check that your `.profile` or `.bashrc` file includes the line `PATH="$HOME/bin:$PATH"`, so that the path includes your home directory every time you open the shell.

If you're using mwn for a Toolforge webservice, use the Kubernetes backend which provides node v10. Mwn is not supported for the legacy Grid Engine backend since it uses node v8.11.1. The [toolforge-node-app-base](https://github.com/siddharthvp/toolforge-node-app-base) template repository can quickly get you started with a basic web tool boilerplate. 


#### MediaWiki compatibility
Mwn is written for and tested on the latest version of MediaWiki used on WMF wikis. Support for MW versions going back to 1.34 is planned.

#### Set up a bot password or OAuth credentials

Mwn supports authentication via both [BotPasswords](https://www.mediawiki.org/wiki/Manual:Bot_passwords) and [OAuth 1.0a](https://www.mediawiki.org/wiki/OAuth/Owner-only_consumers). Use of OAuth is recommended as it does away the need for separate API requests for logging in, and is also more secure. 

Bot passwords, however, are a bit easier to set up. To generate one, go to the wiki's [Special:BotPasswords](https://en.wikipedia.org/wiki/Special:BotPasswords) page. 

**Maxlag**: The default [maxlag parameter](https://www.mediawiki.org/wiki/Manual:Maxlag_parameter) used by mwn is 5 seconds. Requests failing due to maxlag will be automatically retried after pausing for a duration specified by `maxlagPause` (default 5 seconds). A maximum of `maxRetries` will take place (default 3).

**Token handling**: `bot.getCsrfToken()` fetches a CSRF token required for most write operations. The token, once retrieved, is stored in the bot state so that it can be reused any number of times. If an API request fails due to an expired or missing token, the request is automatically retried after fetching a new token.

**Retries**: Mwn automatically retries failing requests `bot.options.maxRetries` times (default: 3). This is useful in case of connectivity resets and the like. As for errors raised by the API itself, note that MediaWiki generally handles these at the response level rather than the protocol level (they still emit a 200 OK response). Mwn will attempt retries for these errors based on the error code. For instance, if the error is `readonly` or `maxlag` , retry is done after a delay. If it's `assertuserfailed` or `assertbotfailed` (indicates a session loss), mwn will try to log in again and then retry. If it's `badtoken`, retry is done after fetching a fresh edit token.

If you're migrating from mwbot, note that:
- `edit` in mwbot is different from `edit` in mwn. You want to use `save` instead.
- If you were using the default formatversion=1 output format, set formatversion: 1 in the config options.

### Getting started

Importing mwn:

In JavaScript:
```js
const {mwn} = require('mwn');
```
Note: Prior to mwn v0.8.0, import was via `const mwn = require('mwn');`

In TypeScript: 
```ts
import {mwn} from 'mwn';
```

Create a new bot instance:
```js
const bot = await mwn.init({
	apiUrl: 'https://en.wikipedia.org/w/api.php',

	// Can be skipped if the bot doesn't need to sign in
	username: 'YourBotUsername',
	password: 'YourBotPassword',

	// Instead of username and password, you can use OAuth 1.0a to authenticate:
	oauth_consumer_token: "16_DIGIT_ALPHANUMERIC_KEY",
	oauth_consumer_secret: "20_DIGIT_ALPHANUMERIC_KEY",
	oauth_access_token: "16_DIGIT_ALPHANUMERIC_KEY",
	oauth_access_secret: "20_DIGIT_ALPHANUMERIC_KEY",

	// Set your user agent (required for WMF wikis, see https://meta.wikimedia.org/wiki/User-Agent_policy):
	userAgent: 'myCoolToolName 1.0 ([[link to bot user page or tool documentation]])',

	// Set default parameters to be sent to be included in every API request
	defaultParams: {
		assert: 'user' // ensure we're logged in
	}
});
```
This creates a bot instance, signs in and fetches tokens needed for editing.

You can also create a bot instance synchronously (without using await):
```js
const bot = new mwn({
	...options
});
```

This creates a bot instance which is not signed in. Then use `bot.login()`, `bot.loginGetToken()`, `bot.initOAuth()` or `bot.getTokensAndSiteInfo()`. Note that `bot.initOAuth()` does not involve an API call. Any error in authentication will surface when the first API call is made.

The bot options can also be set using `setOptions` rather than through the constructor:
```js
bot.setOptions({
	silent: false, // suppress messages (except error messages)
	retryPause: 5000, // pause for 5000 milliseconds (5 seconds) on maxlag error.
	maxRetries: 3, // attempt to retry a failing requests upto 3 times
});
```

### Direct API calls
The `request` method is for directly querying the API. See [mw:API](https://www.mediawiki.org/wiki/API:Main_page) for options. You can create and test your queries in [Special:ApiSandbox](https://www.mediawiki.org/wiki/Special:ApiSandbox). Be sure to set formatversion: 2 in the options for format=json!

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

Mwn provides a great number of convenience methods so that you can avoid writing raw API calls, see the sections below. 

### Editing pages
Edit a page. On edit conflicts, a retry is automatically attempted once.
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

Some more functions associated with editing pages:
```js
// Save a page with the given content without loading it first. Simpler verion of `edit`. Does not offer any edit conflict detection.
bot.save('Page title', 'Page content', 'Edit summary');

// Create a new page.
bot.create('Page title', 'Page content', 'Edit summary');

// Post a new section to a talk page:
bot.newSection('Page title', 'New section header', 'Section content', additionalOptions);
```

### Other basic operations
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

Upload a file from your system to the wiki:
```js
bot.upload('File title', '/path/to/file', 'comment', customParams);
```

Download a file from the wiki:
```js
bot.download('File:File name.jpg', 'Downloaded file name.jpg'); // 2nd param defaults to the on-wiki name if unspecified
```

#### Bulk processing methods

##### continuedQuery(query, maxCallsLimit)
Send an API query, and continue re-sending it with the continue parameters received in the response, until there are no more results (or till `maxCalls` limit is reached). The return value is a promise resolved with the array of responses to individual API calls.

Example: get a list of all active users on the wiki using `continuedQuery` (using [API:Allusers](https://www.mediawiki.org/wiki/API:Allusers)):
```js
bot.continuedQuery({
	"action": "query",
	"list": "allusers",
	"auactiveusers": 1,
	"aulimit": "max"
}, /* max number of calls */ 40).then(jsons => {
	return jsons.reduce((activeusers, json) => {
		return activeusers.concat(json.query.allusers.map(user => user.name));
	}, []);
});
```

A simpler way is to use `bot.continuedQueryGen` which is an [asynchronous generator](https://javascript.info/async-iterators-generators). 
```js
var activeusers = [];
for await (let json of bot.continuedQueryGen({
    "action": "query",
    "list": "allusers",
    "auactiveusers": 1,
    "aulimit": "max"
})) {
    let users = json.query.allusers.map(user => user.name);
    activeusers = activeusers.concat(users);
}
``` 

Use of `continuedQueryGen` is recommended for several reasons:
- If there are a large number of calls involved, continuedQuery will fetch the results of all the API calls before it begins to do anything with the results. `continuedQueryGen` gets the result of each API call and processes them one at a time.
- Since making multiple API calls can take some time. you can add logging statements to know the number of the API calls that have gone through.

##### massQuery(query, nameOfBatchField, batchSize)
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

#### Batch operations
Perform asynchronous tasks (involving API usage) over a number of pages (or other arbitrary items). `batchOperation` uses a default concurrency of 5. Customise this according to how expensive the API operation is. Higher concurrency limits could lead to more frequent API errors.

Usage: `batchOperation(pageList, workerFunction, concurrency)` The `workerFunction` must return a promise.

```js
bot.batchOperation(pageList, (page, idx) => {
	// do something with each page
	// the index of the page in pageList is available as the 2nd argument

	// return a promise in the end
}, /* concurrency */ 5, /* retries */ 2);
```

##### seriesBatchOperation(pageList, workerFunction, sleepDuration)
Perform asynchronous tasks (involving API usage) over a number of pages one after the other, with a sleep duration between each task (default 5 seconds)

The `workerFunction` must return a promise.
```js
bot.seriesBatchOperation(pageList, (page, idx) => {
	// do something with each page
	// the index of the page in pageList is available as the 2nd argument

	// return a promise in the end
}, 5000, 2); // set the sleep duration in milliseconds as the third parameter, max number of retries for each action is set as the 4th parameter
```
Note that `seriesBatchOperation` with delay=0 is same as `batchOperation` with concurrency=1.


## Licensing

Mwn is released under [GNU Lesser General Public License](https://en.wikipedia.org/wiki/GNU_Lesser_General_Public_License) (LGPL) v3.0, since it borrows quite a bit of code from MediaWiki core (GPL v2). LGPL is a more permissive variant of the more popular GNU GPL. Unlike GPL, LPGL _allows_ the work to be used as a library in software not released under GPL-compatible licenses, and even in proprietary software. However, any derivatives of this library should also be released under LGPL or another GPL-compatible license. 
