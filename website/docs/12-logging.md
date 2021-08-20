# Logging

Mwn provides a convenient coloured logging utility, based on [semlog](https://npmjs.com/package/semlog).

```js
const log = mwn.log;

log('[I] Informational message');
log('[S] Success message');
log('[W] Warning message');
log('[E] Error message');
```

Based on the character within `[]`, colouration happens automatically. 
