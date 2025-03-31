Only breaking changes, deprecations and the like are documented in this change log.

#### 3.0.0

- Support for Node.js versions less than 14.x have been dropped. JS files shipped in the package now target ES2020.
- Library now uses axios v1.8 instead of v0.25. Users of the `rawRequest()` that uses raw Axios params should consult the axios changelog.
- Methods in Page class now use the API's action=query instead of action=parse. This improves performance as results are retrieved from the database instead of by invoking the parser. However, this causes some breaking changes:
  - `new bot.Page('...').categories()` now returns a string array of category titles. `sortkey` and `hidden` attributes of categories are no longer available.
  - `new bot.Page('...').links()` now returns a string array of linked page titles. `exists` attribute is no longer available.
  - `new bot.Page('...').templates()` now returns a string array of page titles. `ns` and `exists` attributes are no longer available.
  - All methods are now limited to 50 entries (or 500 entries for users with apihighlimits right). If you need more results, use `bot.continuedQuery()` or `bot.continuedQueryGen()` instead.
- Use of non-PascalCase class names, deprecated in 2.0.0 (see below), are no longer supported. Please use the PascalCase variants instead.
- Class `Mwn.Error.MissingPage` is now `Mwn.MissingPageError`. It is now also exported as `MwnMissingPageError`.
- `loginGetToken()`, deprecated in 0.10.0, has been removed. Please use `login()` instead.
- `oresQueryRevisions()`, deprecated in 2.0.1, has been removed.

#### 2.0.1

- oresQueryRevisions() has been deprecated, since the [ORES service](https://ores.wikimedia.org/docs) is being deprecated in favour of [Lift Wing](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing).

#### 2.0.0

- Class names now follow the standard PascalCase convention. The older names are deprecated.
  - mwn -> Mwn
    - The library should now be imported as `import {Mwn} from 'mwn'` instead of `import {mwn} from 'mwn'`
  - bot.title -> bot.Title (where bot is an instance of Mwn)
  - bot.page -> bot.Page
  - bot.category -> bot.Category
  - bot.file -> bot.File
  - bot.user -> bot.User
  - bot.wikitext -> bot.Wikitext
  - bot.date -> bot.Date
  - mwn.table -> Mwn.Table
- Class for querying Wikimedia EventStreams have been removed. Consider using the dedicated library [wikimedia-streams](https://www.npmjs.com/package/wikimedia-streams) instead.
- set* methods on MwnDate objects (eg. `setUTCDate`) used to be chainable as they returned `this`. Because MwnDate extends the native Date, the change in return values was not possible to represent in TypeScript types ([Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)). This undocumented feature has now been removed for the sake of accurate types.
- `printYaml` logging config option is no longer supported in Mwn.setLoggingConfig() method.
- mwn#queryAuthors() which had been deprecated has now been removed. Instead, please use `queryAuthors()` method on page objects.

#### 0.11.0

- mwn#queryAuthors() now requires `getSiteInfo()` to have run first. Also, it is deprecated in favour of using the `queryAuthors()` method on a page object.

#### 0.10.0

- `loginGetToken()` is now deprecated in favour of `login()` which will now fetch tokens as well.
- TypeScript source files are dropped from the npm package, per the standard practice followed in TypeScript libraries. This should not actually break anything.

#### 0.9.0

BREAKING CHANGES:

- [mwn#rawRequest](https://tools-static.wmflabs.org/mwn/docs/classes/_bot_.mwn.html#rawrequest) now returns the `AxiosResponse` object directly, rather than the `data` part of `AxiosResponse`.
- In cases of error, the shape of the error thrown by [mwn#request](https://tools-static.wmflabs.org/mwn/docs/classes/_bot_.mwn.html#request) is different.
  - Earlier: `error.response` was the API response data along with response and request objects, the former making it a cyclic object.
  - Now: `error.response` is an object with fields {data, headers, status, statusText}

#### 0.8.0

BREAKING CHANGES:

- For imports in JavaScript, use `const {mwn} = require('mwn');` instead of `const mwn = require('mwn');`
