# mwn

![Node.js CI](https://github.com/siddharthvp/mwn/workflows/Node.js%20CI/badge.svg)
![CodeQL](https://github.com/siddharthvp/mwn/workflows/CodeQL/badge.svg)
[![NPM version](https://img.shields.io/npm/v/mwn.svg)](https://www.npmjs.com/package/mwn)
[![Coverage Status](https://coveralls.io/repos/github/siddharthvp/mwn/badge.svg?branch=master)](https://coveralls.io/github/siddharthvp/mwn?branch=master)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Quick links: [Getting Started](https://mwn.toolforge.org/docs/getting-started) — [GitHub](https://github.com/siddharthvp/mwn) — [NPM](https://www.npmjs.com/package/mwn) — [User Documentation](https://mwn.toolforge.org/) — [API Documentation](https://mwn.toolforge.org/docs/api/classes/mwn.html)**

**Mwn** is a modern and comprehensive MediaWiki bot framework for Node.js, originally adapted from [mwbot](https://github.com/Fannon/mwbot).

Mwn works with both JavaScript and TypeScript. It is created with a design philosophy of allowing bot developers to easily and quickly write bot code, without having to deal with the MediaWiki API complications and idiosyncrasies such as logins, tokens, maxlag, query continuations and error handling. [Making raw API calls](https://mwn.toolforge.org/docs/direct-api-calls) is also supported for complete flexibility. Mwn uses [JSON with formatversion 2](https://www.mediawiki.org/wiki/API:JSON_version_2#Using_the_new_JSON_results_format) by default. The [axios](https://www.npmjs.com/package/axios) library is used for HTTP requests.

This library provides TypeScript type definitions for all its functions, as well as for MediaWiki API request objects (MW core + several extensions). API responses are also typed for the common operations.

This library uses mocha and chai for tests, and has [extensive test coverage](https://coveralls.io/github/siddharthvp/mwn?branch=master). Testing is automated using a CI workflow on GitHub Actions.

To install, run `npm install mwn`.

[![Download stats](https://nodei.co/npm/mwn.png?downloads=true&downloadRank=true)](https://nodei.co/npm/mwn/)

### Documentation

Up-to-date documentation is **[hosted on Toolforge](https://mwn.toolforge.org/)**.

API documentation (automatically generated via [typedoc](https://npmjs.com/package/typedoc)) is also available at <https://mwn.toolforge.org/docs/api>.

### Features

- **Handling multiple users and wikis**: Mwn can seamlessly work with multiple bot users signed into the same wiki, and multiple wikis at the same time. You just have to create multiple bot instances – each one representing a wiki + user. Each bot instance uses an isolated cookie jar; all settings are also isolated.

- **Token handling**: [Tokens](https://www.mediawiki.org/wiki/API:Tokens) are automatically fetched as part of `mwn.init()` or `bot.login()` or `bot.getTokensAndSiteInfo()`. Once retrieved, they are stored in the bot state and can be reused any number of times. If any API request fails due to an expired or missing token, the request is automatically retried after fetching a new token. `bot.getTokens()` can be used to refresh the token cache, though mwn manages this, so you'd never need to explicitly use that.

- **Maxlag**: The default [maxlag parameter](https://www.mediawiki.org/wiki/Manual:Maxlag_parameter) used by mwn is 5 seconds. Requests failing due to maxlag will be automatically retried after pausing for the duration specified in the Retry-After header of the response (or a configurable `maxlagPause` – default 5 seconds, if there's no such header). A maximum of `maxRetries` will take place (default 3).

- **Retries**: Mwn automatically retries failing requests `bot.options.maxRetries` times (default: 3). This is useful in case of connectivity resets and the like. As for errors raised by the API itself, note that MediaWiki generally handles these at the response level rather than the protocol level (they still emit a 200 OK response). Mwn will attempt retries for these errors based on the error code. For instance, if the error is `readonly` or `maxlag` , retry is done after a delay. If it's `assertuserfailed` or `assertbotfailed` (indicates a session loss), mwn will try to log in again and then retry. If it's `badtoken`, retry is done after fetching a fresh edit token.

- **Handling query continuation**: Mwn uses [asynchronous generators](https://javascript.info/async-iterators-generators), ([for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loops) to provide a very intuitive interface around MediaWiki API's [query continuation](https://www.mediawiki.org/wiki/API:Query#Example_4:_Continuing_queries). See **[Handling query continuation](https://mwn.toolforge.org/docs/handling-query-continuation)**.

- **[Parsing wikitext](https://mwn.toolforge.org/docs/working-with-wikitext)**: Mwn provides methods for common wikitext parsing needs (templates, links, and simple tables).

- **[Titles](https://mwn.toolforge.org/docs/working-with-titles)**: Work with page titles with the very same API as the in-browser [mw.Title](https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Title) that userscript/gadget developers are familiar with.

- **[Emergency shutoff](https://mwn.toolforge.org/docs/emergency-shutoff)**

- **[Bot exclusion compliance](https://mwn.toolforge.org/docs/exclusion-compliance)**

- **[Batch operations](https://mwn.toolforge.org/docs/bulk-processing#batch-operations)**: Perform a large number of tasks (like page edits) with control over the concurrency (default 5). Failing actions can be set to automatically retry.

### Compatibility

Mwn is currently compatible with Node.js v10 and above. In the future, compatibility with EOL Node versions may be dropped.

As for MediaWiki support, the CI pipelines only check for compatibility with the latest LTS version. But it should work fine with version 1.35 and above.

### Contributing

Patches are very much welcome. See <https://mwn.toolforge.org/docs/developing> for instructions.

### Licensing

Mwn is released under [GNU Lesser General Public License](https://en.wikipedia.org/wiki/GNU_Lesser_General_Public_License) (LGPL) v3.0, since it borrows quite a bit of code from MediaWiki core (GPL v2). LGPL is a more permissive variant of GNU GPL. Unlike GPL, it enables this library to be used in software not released under GPL-compatible licenses, and even in proprietary software. However, any derivatives of this library should be released under an GPL-compatible license (like LGPL). That being said, this is not legal advice.
