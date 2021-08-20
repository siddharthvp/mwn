# Integration with other APIs

Apart from the [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page), Mwn integrates with a few other APIs:

### ORES
See https://ores.wikimedia.org/ for details.
Get ORES scores for revisions:
```js
await bot.oresQueryRevisions(
	'https://ores.wikimedia.org/',		// ORES endpoint URL
	['articlequality', 'drafttopic'],	// ORES modes       
	['76923582', '2387429']				// Revision IDs
);
```


### EventStreams
See https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
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
See https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews
```js
const page = new bot.page('Deaths in 2020');
const pageViewData = await page.pageViews({
	// See https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html for available options
});
```
The [PageViewOptions](https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html) argument is optional. Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/pageviewdata.html">PageViewData</a>[]>.

### WikiWho
See https://wikiwho.wmflabs.org/

Fetch the list of top contributors to an article. Available for limited number of Wikipedias.

```js
const page = new bot.page('Lorem ipsum');
const contributorData = await page.queryAuthors();
```
Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/authorshipdata.html)">AuthorshipData</a>>.
