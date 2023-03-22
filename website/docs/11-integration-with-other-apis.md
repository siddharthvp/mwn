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

### PageViews

See <https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews>

```js
const page = new bot.page('Deaths in 2020');
const pageViewData = await page.pageViews({
	// See https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html for available options
});
```

The [PageViewOptions](https://mwn.toolforge.org/docs/api/interfaces/pageviewoptions.html) argument is optional. Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/pageviewdata.html">PageViewData</a>[]>.

### WikiWho

See <https://wikiwho.wmflabs.org/>

Fetch the list of top contributors to an article. Available for limited number of Wikipedias.

```js
const page = new bot.page('Lorem ipsum');
const contributorData = await page.queryAuthors();
```

Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/authorshipdata.html">AuthorshipData</a>>.

### EventStreams

Methods for [EventStreams](https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams) access have been removed in v2. Consider using the dedicated library <https://www.npmjs.com/package/wikimedia-streams> instead.
