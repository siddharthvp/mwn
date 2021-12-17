# Bot exclusion compliance

Mwn's edit() method can be configured to respect {{nobots}} or equivalent. If the text of the page tests positive for the exclusionRegex you set in the bot options, edit will be aborted.

```js
bot.setOptions({
	editConfig: {
		exclusionRegex: /\{\{nobots\}\}/i
	}
});
```

It's also possible to do this on a per-edit basis:

```js
bot.edit(
	'Page name',
	(rev) => {
		// edit the page the way you want, in this lame example we're just appending lorem ipsum
		return rev.content + 'lorem ipsum';
	},
	/* editConfig */ {
		exclusionRegex: /\{\{nobots\}\}/i
	}
);
```

Exclusion compliance is _not_ enabled by default.
