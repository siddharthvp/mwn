# Dates

Mwn provides a rich wrapper around the native [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) interface.

The constructor support the common MediaWiki datetime formats:
```js
const date1 = new bot.date('13:45, 2 April 2020 (UTC)'); // This won't parse with JS native Date!
const date2 = new bot.date('20210304134567'); // MW database timestamp format.
```

in addition to everything that native JS Date supports:
```js
const date1 = new bot.date();
const date2 = new bot.date('3 December 2020');
```

Note that it inherits the weirdities of JS Date - even "NY 12345" gets parsed as valid date, so per [MDN recommendation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#timestamp_string) you should not parse dates as strings of unknown format.

All methods on native date are inherited, for instance:
```js
date.getUTCDate();
date.toISOString();
```


But in addition, you can get names of the months and days of the week (in English):
```js
date.getMonthName();
date.getUTCMonthName();
date.getDayName();
date.getUTCDayName(); 
```

Add and subtract dates. This mutates the original date as well as returns the mutated object to allow chaining. The supported units are seconds, minutes, hours, days, weeks, months and years.
```js
date.add(1, 'hour');
date.add(4, 'hours');
date.subtract(5, 'hours').subtract(30, 'minutes');
```

Check if a date is before or after another date (which can be either an Mwn date or a normal Date object).
```js
date.isBefore(new Date()); // boolean
date.isAfter(new bot.date());
```
