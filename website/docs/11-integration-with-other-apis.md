# Integration with other APIs

Apart from the [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page), Mwn integrates with a few other APIs for Wikimedia wikis:

### ORES

See <https://ores.wikimedia.org/> for details.
Get ORES scores for revisions:

```js
await bot.oresQueryRevisions(
	'https://ores.wikimedia.org/',		// ORES endpoint URL
	['articlequality', 'drafttopic'],	// ORES models       
	['76923582', '2387429']				// Revision IDs
);
```

### EventStreams

See <https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams>

```js
const stream = bot.stream(['recentchange']);
stream.addListener(
	// Consider event only if this function returns true
	function eventFilter(data) {
		return data.wiki === 'enwiki';
	},
	
	// Run this function for every filtered event
	async function worker(data) {
		// do something with data
	}
);
```

### PageViews

See <https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews>

```js
const page = new bot.page('Deaths in 2020');
const pageViewData = await page.pageViews({
	// See https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html for available options
});
```

The [PageViewOptions](https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html) argument is optional. Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/pageviewdata.html">PageViewData</a>[]>.
