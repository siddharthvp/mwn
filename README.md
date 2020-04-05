# MWB

WIP:

MWB is a modern MediaWiki bot framework in NodeJS, orginally based on [mwbot](https://github.com/Fannon/mwbot).

### Setup

Until MWB is released on npm, enter the `node_modules` directory of your project and run `git clone https://github.com/siddharthvp/MWB.git`.

#### MWB uses JSON with formatversion 2 by default; formatversion 2 is an [improved JSON output format](https://www.mediawiki.org/wiki/API:JSON_version_2#Using_the_new_JSON_results_format) introduced in MediaWiki in 2015.


#### Node version
MWB is written with Node.js 13 in hand. While everything may still work in older versions of Node, you can consider upgrading to Node.js 13. If your bot is hosted on [Toolforge](https://tools.wmflabs.org/), you can install the latest node.js in your home directory, using:
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
- `edit` in mwbot is different from `edit` in MWB. You want to use `save` instead.
- If you were using the default formatversion=1 output format, set formatversion: 1 in the config options.

### Documentation

Create a new bot instance:
```js
const bot = new MWB();
```

Edit a page:
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

Upload a file from your PC to the wiki:
```js
bot.upload('File title', '/path/to/file', 'comment', customParams);
```

#### Bulk processing methods
Send an API query, and continue re-sending it with the continue parameters received in the response, until there are no more results (or till `maxCalls` limit is reached). The return value is a promise resolved with the array of responses to individual API calls.
```js
bot.continousQuery(apiQueryObject, maxCalls=10)
```

Example: get a list of all active users on the wiki using `continuousQuery` (using [API:Allusers](https://www.mediawiki.org/wiki/API:Allusers)):
```js
bot.continuousQuery({
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