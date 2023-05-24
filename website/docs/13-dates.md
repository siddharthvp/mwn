# Dates

Mwn provides a rich wrapper around the native [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) interface.

The constructor support the common MediaWiki datetime formats:

```js
const date1 = new bot.Date('13:45, 2 April 2020 (UTC)'); // This won't parse with JS native Date!
const date2 = new bot.Date('20210304134567'); // MW database timestamp format.
```

in addition to everything that native JS Date supports:

```js
const date1 = new bot.Date();
const date2 = new bot.Date('3 December 2020');
```

Note that it inherits the weirdities of JS Date - even "NY 12345" gets parsed as valid date, so per [MDN recommendation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#timestamp_string) you should not parse dates as strings of unknown format.

All methods on native date are inherited, for instance:

```js
date.getUTCDate();
date.toISOString();
```

But in addition, you can get names of the months and days of the week (by default in English):

```js
date.getMonthName();
date.getUTCMonthName();
date.getDayName();
date.getUTCDayName(); 
```

**Format dates to text**: (See <https://mwn.toolforge.org/docs/api/interfaces/mwndate.html#format> for the full formatting syntax)

```js
date.format('D MMMM YYYY'); // -> "3 December 2020"
```

:::info
By default, month and day names are in English. However, you can customise the language used by overwriting `bot.Date.localeData` object. The easiest way to do that is via `bot.Date.populateLocaleData()`.

```js
await bot.Date.populateLocaleData(); // use content language of the wiki
await bot.Date.populateLocaleData('fr'); // OR explicitly set the language like this 
```

The data is stored in the bot object. If you have multiple bots signed in to different wikis, you can use different languages for each.
:::

Get human-readable description of dates, such as "Yesterday at 6:43 PM" or "Last Thursday at 11:45 AM":

```js
console.log(`Last modified ${date.calendar()}`); // -> Last modified Yesterday at 6:43 PM
```

**Add and subtract dates**: This mutates the original date as well as returns the mutated object to allow chaining. The supported units are seconds, minutes, hours, days, weeks, months and years.

```js
date.add(1, 'hour');
date.add(4, 'hours');
date.subtract(5, 'hours').subtract(30, 'minutes');
```

Check if a date is before or after another date (which can be either an Mwn date or a normal Date object).

```js
date.isBefore(new Date()); // boolean
date.isAfter(new bot.Date());
```
