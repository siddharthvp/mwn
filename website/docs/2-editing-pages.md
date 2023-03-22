# Editing pages

Edit a page. On edit conflicts, a retry is automatically attempted once.

```js
bot.edit('Page title', (rev) => {
	// rev.content gives the revision text
	// rev.timestamp gives the revision timestamp

	let text = rev.content.replace(/foo/g, 'bar');

	return {
		// return parameters needed for [[mw:API:Edit]]
		text: text,
		summary: 'replacing foo with bar',
		minor: true
	};
});
```

Some more functions associated with editing pages:

Save a page with the given content without loading it first. Simpler version of `edit`. Does not offer any edit conflict detection.

```js
await bot.save('Page title', 'Page content', 'Edit summary');
```

Create a new page:

```js
await bot.create('Page title', 'Page content', 'Edit summary');
```

Post a new section to a talk page:

```js
await bot.newSection('Page title', 'New section header', 'Section content', additionalOptions);
```
