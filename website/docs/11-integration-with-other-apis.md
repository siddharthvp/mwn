# Integration with other APIs

Apart from the [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page), Mwn integrates with a few other APIs for Wikimedia wikis:

### PageViews

See <https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews>

```js
const page = new bot.Page('Deaths in 2020');
const pageViewData = await page.pageViews({
	// See https://mwn.toolforge.org/docs/api/interfaces/PageViewOptions.html for available options
});
```

The [PageViewOptions](https://mwn.toolforge.org/docs/api/interfaces/PageViewOptions.html) argument is optional. Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/PageViewData.html">PageViewData</a>[]>.

### WikiWho

See <https://wikiwho.wmflabs.org/>

Fetch the list of top contributors to an article. Available for limited number of Wikipedias.

```js
const page = new bot.page('Lorem ipsum');
const contributorData = await page.queryAuthors();
```

Return type is Promise<<a href="https://mwn.toolforge.org/docs/api/interfaces/AuthorshipData.html">AuthorshipData</a>>.

### ORES

**Deprecated** as of v2.0.1 since ORES service has been deprecated in favour of [Lift Wing](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing). **Removed** in v3.0.0.

### EventStreams

Methods for [EventStreams](https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams) access have been removed in v2. Consider using the dedicated library <https://www.npmjs.com/package/wikimedia-streams> instead.
