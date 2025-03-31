# Logging

Mwn provides a convenient coloured logging utility, based on [semlog](https://npmjs.com/package/semlog).

```js
const log = Mwn.log;

log('[I] Informational message');
log('[S] Success message');
log('[W] Warning message');
log('[E] Error message');
```

Based on the character within `[]`, colouration happens automatically.

To configure logging, use [Mwn.setLoggingConfig()](https://mwn.toolforge.org/docs/api/classes/Mwn.html#setloggingconfig). Please note that logging configuration is global and shared across all Mwn instances.
