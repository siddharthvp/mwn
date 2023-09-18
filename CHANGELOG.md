Only breaking changes, deprecations and the like are documented in this change log.

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
- Class for querying Wikimedia EventStreams have been removed. Consider using the dedicated library [wikimedia-streams](https://www.npmjs.com/package/wikimedia-streams) instead.
- set* methods on MwnDate objects (eg. `setUTCDate`) used to be chainable as they returned `this`. Because MwnDate extends the native Date, the change in return values was not possible to represent in TypeScript types ([Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)). This undocumented feature has now been removed for the sake of accurate types.
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
