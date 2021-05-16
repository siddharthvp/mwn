Only breaking changes, deprecations and the like are documented in this change log.

#### 0.11.0
- mwn#queryAuthors() now requires `getSiteInfo()` to have run first. Also, it is deprecated in favour of using the `queryAuthors()` method on a page object.

#### 0.10.0

-   `loginGetToken()` is now deprecated in favour of `login()` which will now fetch tokens as well.
-   TypeScript source files are dropped from the npm package, per the standard practice followed in TypeScript libraries. This should not actually break anything.

#### 0.9.0

BREAKING CHANGES:

-   [mwn#rawRequest](https://tools-static.wmflabs.org/mwn/docs/classes/_bot_.mwn.html#rawrequest) now returns the `AxiosResponse` object directly, rather than the `data` part of `AxiosResponse`.
-   In cases of error, the shape of the error thrown by [mwn#request](https://tools-static.wmflabs.org/mwn/docs/classes/_bot_.mwn.html#request) is different.
    -   Earlier: `error.response` was the API response data along with response and request objects, the former making it a cyclic object.
    -   Now: `error.response` is an object with fields {data, headers, status, statusText}

#### 0.8.0

BREAKING CHANGES:

-   For imports in JavaScript, use `const {mwn} = require('mwn');` instead of `const mwn = require('mwn');`
