# Bulk processing

### continuedQuery / continuedQueryGen
See [Handling query continuation](/docs/handling-query-continuation) for more details.

continuedQuery returns a promised resolved with the array of all individual API response.

Use of `continuedQueryGen` is recommended since continuedQuery will fetch the results of all the API calls before it begins to do anything with the results. `continuedQueryGen` gets the result of each API call and processes them one at a time.

### massQuery / massQueryGen
MediaWiki sets a limit of 500 (50 for non-bots) on the number of pages that can be queried in a single API call. To query more than that, `massQuery` or `massQueryGen` can be used. This splits the page list into batches of 500 and sends individual queries and returns a promise resolved with the array of all individual API call responses.

Example: get the protection status of a large number of pages:

```js
bot.massQuery({
	action: 'query',
	format: 'json',
	prop: 'info',
	titles: ['Page1', 'Page2', 'Page1300'], // array of page names
	inprop: 'protection'
}) // 2nd parameter is taken as 'titles' by default
	.then((jsons) => {
		// jsons is the array of individual JSON responses.
	});
```

Any errors in the individual API calls will not cause the entire massQuery to fail, but the data at the array index corresponding to that API call will be error object.

massQueryGen is the generator equivalent that yields each API response as when they're received.

### Batch operations

Perform asynchronous tasks (involving API usage) over a number of pages (or other arbitrary items). `batchOperation` uses a default concurrency of 5. Customise this according to how expensive the API operation is. Higher concurrency limits could lead to more frequent API errors.

-   `batchOperation(pageList, workerFunction, concurrency, maxRetries)`: The `workerFunction` must return a promise.

```js
bot.batchOperation(
	pageList,
	(page, idx) => {
		// do something with each page
		// the index of the page in pageList is available as the 2nd argument
		// return a promise in the end
	},
	/* concurrency */ 5,
	/* retries */ 2
);
```

-   `bot.seriesBatchOperation(pageList, workerFunction, sleepDuration, retries)` can be used for serial operations, with a sleep duration between each task (default 5 seconds).

```js
bot.seriesBatchOperation(
	pageList,
	(page, idx) => {
		// do something with each page
		// the index of the page in pageList is available as the 2nd argument
		// return a promise in the end
	},
	5000,
	2
); // set the sleep duration in milliseconds as the third parameter, max number of retries for each action is set as the 4th parameter
```

Note that `seriesBatchOperation` with delay=0 is same as `batchOperation` with concurrency=1.
