---
sidebar_position: 1
---

# Setting up Mwn

Installation: `npm install mwn`


Importing mwn:

In JavaScript:

```js
const { mwn } = require('mwn');
```

Note: Prior to mwn v0.8.0, import was via `const mwn = require('mwn');`

In TypeScript:

```ts
import { mwn } from 'mwn';
```

If you're migrating from mwbot, note that:

-   `edit` in mwbot is different from `edit` in mwn. You want to use `save` instead.
-   If you were using the default formatversion=1 output format, set formatversion: 1 in the config options.

Create a new bot instance:

```js
const bot = await mwn.init({
	apiUrl: 'https://en.wikipedia.org/w/api.php',

	// Can be skipped if the bot doesn't need to sign in
	username: 'YourBotUsername',
	password: 'YourBotPassword',

	// Instead of username and password, you can use OAuth 1.0a to authenticate,
	// if the wiki has Extension:OAuth enabled
	OAuthCredentials: {
		consumerToken: '16_DIGIT_ALPHANUMERIC_KEY',
		consumerSecret: '20_DIGIT_ALPHANUMERIC_KEY',
		accessToken: '16_DIGIT_ALPHANUMERIC_KEY',
		accessSecret: '20_DIGIT_ALPHANUMERIC_KEY'
	},

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

This creates a bot instance which is not signed in. Then to authenticate, use `bot.login()` which returns a promise. If using OAuth, use `bot.initOAuth()` followed by `bot.getTokensAndSiteInfo()`. Note that `bot.initOAuth()` does not involve an API call. Any error in authentication will surface on running bot.getTokensAndSiteInfo().

The bot options can also be set using `setOptions` rather than through the constructor:

```js
bot.setOptions({
	silent: false, 		// suppress messages (except error messages)
	retryPause: 5000, 	// pause for 5000 milliseconds (5 seconds) on maxlag error.
	maxRetries: 3 		// attempt to retry a failing requests upto 3 times
});
```
