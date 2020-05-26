/**
 *
 *  mwn: a MediaWiki bot framework for NodeJS
 *
 * 	Copyright (C) 2020 Siddharth VP
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

/**
 * Attributions:
 * Parts of the code are adapted from MWBot <https://github.com/Fannon/mwbot/src/index.js>
 * released under the MIT license. Copyright (c) 2015-2018 Simon Heimler.
 *
 * Some parts are copied from the mediawiki.api module in mediawiki core
 * <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.api>
 * released under GNU GPL v2.
 *
 */

'use strict';

const axios = require('axios');
const tough = require('tough-cookie');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
axiosCookieJarSupport(axios);

const fs = require('fs');
const path = require('path');
const ispromise = require('is-promise');
const semlog = require('semlog');
const log = semlog.log;

const Title = require('./title');
const Page = require('./page');
const Wikitext = require('./wikitext');
const User = require('./user');
const Category = require('./category');
const File = require('./file');
const Util = require('./util');
const static_utils = require('./static_utils');

class Bot {


	/***************** CONSTRUCTOR ********************/

	/**
	 * Constructs a new bot instance
	 * It is advised to create one bot instance for every API to use
	 * A bot instance has its own state (e.g. tokens) that is necessary for some operations
	 *
	 * @param {Object} [customOptions] - Custom options
	 */
	constructor(customOptions) {

		/**
		 * Bot instance Login State
		 * Is received from the MW Login API and contains token, userid, etc.
		 *
		 * @type {object}
		 */
		this.state = {};

		/**
		 * Bot instance is logged in or not
		 *
		 * @type {boolean}
		 */
		this.loggedIn = false;

		/**
		 * Bot instances edit token. Initially set as an invalid token string
		 * so that the badtoken handling logic is invoked if the token is
		 * not set before a query is sent.
		 *
		 * @type {string}
		 */
		this.csrfToken = '%notoken%';

		/**
		 * Internal statistics
		 *
		 * @type {object}
		 */
		this.counter = {
			total: 0,
			resolved: 0,
			fulfilled: 0,
			rejected: 0
		};

		/**
		 * Default options.
		 * Should be immutable
		 *
		 * @type {object}
		 */
		this.defaultOptions = {
			// suppress messages, except for error messages
			silent: false,

			// site API url, example https://en.wikipedia.org/w/api.php
			apiUrl: null,

			// bot login username and password, setup using Special:BotPasswords
			username: null,
			password: null,

			// does your account have apihighlimits right? Yes for bots and sysops
			hasApiHighLimit: true,

			// milliseconds to pause before retrying after a maxlag error
			maxlagPause: 5000,

			// max number of times to retry the same request on maxlag error.
			maxlagMaxRetries: 3
		};

		/**
		 * Actual, current options of the bot instance
		 * Mix of the default options, the custom options and later changes
		 *
		 * @type {Object}
		 */
		this.options = merge(this.defaultOptions, customOptions);

		/**
		 * Cookie jar for the bot instance - holds session and login cookies
		 *
		 * @type {tough.CookieJar}
		 */
		this.cookieJar = new tough.CookieJar();

		/**
		 * Request options for the axios library.
		 * Change the defaults using setRequestOptions()
		 *
		 * @type {Object}
		 */
		this.requestOptions = {
			method: 'post',
			headers: {
				'User-Agent': 'mwn'
			},
			params: {
			},
			data: {
				format: 'json',
				formatversion: '2',
				maxlag: 5
			},
			transformRequest: [
				function(data) {
					return Object.entries(data).map(([key, val]) => {
						return encodeURIComponent(key) + '=' + encodeURIComponent(val);
					}).join('&');
				}
			],
			timeout: 120000, // 120 seconds
			jar: this.cookieJar,
			withCredentials: true,
			responseType: 'json'
		};

		/**
		 * Title class associated with the bot instance
		 */
		this.title = Title;

		/**
		 * Page class associated with bot instance
		 */
		this.page = Page(this);

		/**
		 * Wikitext class associated with the bot instance
		 */
		this.wikitext = Wikitext(this);

		/**
		 * User class associated with the bot instance
		 */
		this.user = User(this);

		/**
		 * Category class associated with the bot instance
		 */
		this.category = Category(this);

		/**
		 * File class associated with the bot instance
		 */
		this.file = File(this);

		/**
		 * Util class associated with the bot instance
		 */
		this.util = Util();

		// SEMLOG OPTIONS
		semlog.updateConfig(this.options.semlog || {});
	}

	/**
	 * Set and overwrite mwn options
	 *
	 * @param {Object} customOptions
	 */
	setOptions(customOptions) {
		this.options = merge(this.options, customOptions);
	}

	/**
	 * Sets the API URL for MediaWiki requests
	 * This can be uses instead of a login, if no actions are used that require login.
	 *
	 * @param {String} apiUrl - API url to MediaWiki, e.g. https://en.wikipedia.org/w/api.php
	 */
	setApiUrl(apiUrl) {
		this.options.apiUrl = apiUrl;
	}

	/**
	 * Sets and overwrites the raw request options, used by the axios library
	 * See https://www.npmjs.com/package/axios
	 *
	 * @param {Object} customRequestOptions
	 */
	setRequestOptions(customRequestOptions) {
		return mergeRequestOptions(this.requestOptions, customRequestOptions);
	}

	/**
	 * Set the default parameters to be sent in API calls.
	 * @param {Object} params - default parameters
	 */
	setDefaultParams(params) {
		this.requestOptions.data = merge(this.requestOptions.data, params);
	}

	/**
	 * Set your API user agent. See https://meta.wikimedia.org/wiki/User-Agent_policy
	 * Required for WMF wikis.
	 * @param {string} userAgent
	 */
	setUserAgent(userAgent) {
		if (!this.requestOptions.headers) {
			this.requestOptions.headers = {};
		}
		this.requestOptions.headers['User-Agent'] = userAgent;
	}

	/************ CORE REQUESTS ***************/

	/**
	 * Executes a raw request
	 * Uses the axios library
	 *
	 * @param {object} requestOptions
	 *
	 * @returns {Promise}
	 */
	rawRequest(requestOptions) {

		this.counter.total += 1;

		this.counter.resolved += 1;
		if (!requestOptions.url) {
			this.counter.rejected += 1;
			return Promise.reject(new Error('No API URL provided!'));
		}
		return axios(requestOptions).then(response => {
			this.counter.fulfilled +=1;
			return response.data;
		}, error => {
			this.counter.rejected +=1;
			return Promise.reject(error);
		});

	}


	/**
	 * Executes a request with the ability to use custom parameters and custom
	 * request options
	 *
	 * @param {object} params               Request Parameters
	 * @param {object} customRequestOptions Custom request options
	 *
	 * @returns {Promise}
	 */
	request(params, customRequestOptions) {

		let requestOptions = merge({
			url: this.options.apiUrl,

			// retryNumber isn't actually used by the API, but this is
			// included here for tracking our maxlag retry count.
			retryNumber: 0

		}, mergeRequestOptions(this.requestOptions, customRequestOptions || {}));

		requestOptions.data = merge(requestOptions.data, params);

		// pre-process params:
		// Convert arrays to |-delimited strings. If one of the array items
		// itself contains a |, then use \x1f as delimiter and begin the string
		// with \x1f.
		// Copied from mw.Api().preprocessParameters & refactored to ES6
		Object.entries(requestOptions.data).forEach(([key, val]) => {
			if (Array.isArray(val)) {
				if (!val.join('').includes('|')) {
					requestOptions.data[key] = val.join('|');
				} else {
					requestOptions.data[key] = '\x1f' + val.join('\x1f');
				}
			} else if (val === false || val === undefined) {
				delete requestOptions.data[key];
			}
		});

		return this.rawRequest(requestOptions).then((response) => {
			if (typeof response !== 'object') {
				let err = new Error('invalidjson: No valid JSON response');
				err.code = 'invalidjson';
				err.info = 'No valid JSON response';
				err.response = response;
				return Promise.reject(err) ;
			}

			// See https://www.mediawiki.org/wiki/API:Errors_and_warnings#Errors
			if (response.error) {

				// This will not work if the token type to be used is defined by an
				// extension, and not a part of mediawiki core
				if (response.error.code === 'badtoken') {
					return Promise.all(
						[this.getTokenType(requestOptions.data.action), this.getTokens()]
					).then(([tokentype]) => {
						var token = this.state[ (tokentype || 'csrf') + 'token' ];
						requestOptions.data.token = token;
						return this.request({}, requestOptions);
					});
				}

				// Handle maxlag, see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
				if (response.error.code === 'maxlag' && requestOptions.retryNumber < this.options.maxlagMaxRetries) {
					log(`[W] Encountered maxlag error, waiting for ${this.options.maxlagPause/1000} seconds before retrying`);
					return sleep(this.options.maxlagPause).then(() => {
						requestOptions.retryNumber++;
						return this.request({}, requestOptions);
					});
				}

				let err = new Error(response.error.code + ': ' + response.error.info);
				// Enhance error object with additional information
				err.errorResponse = true;
				err.code = response.error.code;
				err.info = response.error.info;
				err.response = response;
				err.request = requestOptions;
				return Promise.reject(err);
			}

			return response;

		});

	}


	/************** CORE FUNCTIONS *******************/


	/**
	 * Executes a Login
	 *
	 * @see https://www.mediawiki.org/wiki/API:Login
	 *
	 * @param {object} [loginOptions] - object containing the apiUrl, username,
	 * and password
	 *
	 * @returns {Promise}
	 */
	login(loginOptions) {

		this.options = merge(this.options, loginOptions);

		if (!this.options.username || !this.options.password || !this.options.apiUrl) {
			return Promise.reject(new Error('Incomplete login credentials!'));
		}

		let loginString = this.options.username + '@' + this.options.apiUrl.split('/api.php').join('');

		// Fetch login token, also at the same time, fetch info about namespaces for Title
		return this.request({
			action: 'query',
			meta: 'tokens|siteinfo',
			type: 'login',
			siprop: 'general|namespaces|namespacealiases',

			// unset the assert parameter (in case it's given by the user as a default
			// option), as it will invariably fail until login is performed.
			assert: undefined

		}).then((response) => {

			if (!response.query || !response.query.tokens || !response.query.tokens.logintoken) {
				let err = new Error('Failed to get login token');
				err.response = response;
				log('[E] [mwn] Login failed with invalid response: ' + loginString);
				return Promise.reject(err) ;
			}
			this.state = merge(this.state, response.query.tokens);

			Title.processNamespaceData(response);

			return this.request({
				action: 'login',
				lgname: this.options.username,
				lgpassword: this.options.password,
				lgtoken: response.query.tokens.logintoken,
				assert: undefined // as above, assert won't work till the user is logged in
			});

		}).then((response) => {
			if (response.login && response.login.result === 'Success') {
				this.state = merge(this.state, response.login);
				this.loggedIn = true;
				if (!this.options.silent) {
					log('[S] [mwn] Login successful: ' + loginString);
				}
				return this.state;
			}

			let reason = 'Unknown reason';
			if (response.login && response.login.result) {
				reason = response.login.result;
			}
			let err = new Error('Could not login: ' + reason);
			err.response = response;
			log('[E] [mwn] Login failed: ' + loginString);
			return Promise.reject(err) ;

		});

	}

	/**
	 * Log out of the account
	 * @returns {Promise} - resolved with an empty object if successful
	 */
	logout() {
		return this.request({
			action: 'logout',
			token: this.csrfToken
		}); // returns an empty response if successful
	}

	/**
	 * Gets namespace-related information for use in title nested class.
	 * This need not be used if login() is being used. This is for cases
	 * where mwn needs to be used without logging in.
	 * @returns {Promise}
	 */
	getSiteInfo() {
		return this.request({
			action: 'query',
			meta: 'siteinfo',
			siprop: 'general|namespaces|namespacealiases'
		}).then(result => {
			Title.processNamespaceData(result);
		});
	}

	/**
	 * Get tokens and saves them in this.state
	 * @returns {Promise<void>}
	 */
	getTokens() {
		return this.request({
			action: 'query',
			meta: 'tokens',
			type: 'csrf|createaccount|login|patrol|rollback|userrights|watch'
		}).then((response) => {
			if (response.query && response.query.tokens) {
				this.csrfToken = response.query.tokens.csrftoken;
				this.state = merge(this.state, response.query.tokens);
			} else {
				let err = new Error('Could not get token');
				err.response = response;
				return Promise.reject(err) ;
			}
		});
	}

	/**
	 * Gets an edit token (also used for most other actions
	 * such as moving and deleting)
	 * This is only compatible with MW >= 1.24
	 * @returns {Promise<string>}
	 */
	getCsrfToken() {
		return this.getTokens().then(() => this.csrfToken);
	}

	/**
	 * Get type of token to be used with an API action
	 * @param {string} action - API action parameter
	 * @returns {Promise<string>}
	 */
	getTokenType(action) {
		return this.request({
			action: 'paraminfo',
			modules: action
		}).then(response => {
			return response.paraminfo.modules[0].parameters.find(p => p.name === 'token').tokentype;
		});
	}

	/**
	 * Combines Login  with getCsrfToken
	 *
	 * @param loginOptions
	 * @returns {Promise<string>}
	 */
	loginGetToken(loginOptions) {
		return this.login(loginOptions).then(() => {
			return this.getCsrfToken();
		});
	}

	/**
	 * Get the wiki's server time
	 * @returns {string}
	 */
	getServerTime() {
		return this.request({
			action: 'query',
			curtimestamp: 1
		}).then(data => {
			return data.curtimestamp;
		});
	}

	/***************** HELPER FUNCTIONS ******************/


	// adapted from mw.Api().edit
	/**
	* @param {string|number|Title} title - Page title or page ID or Title object
	* @param {Function} transform - Callback that prepares the edit. It takes one
	* argument that is an { content: 'string: page content', timestamp: 'string:
	* time of last edit' } object. This function should return an object with
	* edit API parameters or just the updated text, or a promise providing one of
	* those.
	* @param {number} [conflictRetries=2] - max number of times to retry edit on
	* encountering an edit conflict (default 2)
	* @return {Promise<Object>} Edit API response
	*/
	edit(title, transform, conflictRetries=2) {

		var basetimestamp, curtimestamp;

		return this.request(merge({
			action: 'query',
			prop: 'revisions',
			rvprop: ['content', 'timestamp'],
			formatversion: '2',
			curtimestamp: !0
		}, makeTitles(title))).then(data => {

			var page, revision;
			if (!data.query || !data.query.pages) {
				return Promise.reject('unknown');
			}
			page = data.query.pages[0];
			if (!page || page.invalid) {
				return Promise.reject('invalidtitle');
			}
			if (page.missing) {
				return Promise.reject('nocreate-missing');
			}
			revision = page.revisions[0];
			basetimestamp = revision.timestamp;
			curtimestamp = data.curtimestamp;

			return transform({
				timestamp: revision.timestamp,
				content: revision.content
			});

		}).then(returnVal => {
			if (typeof returnVal !== 'string' && !returnVal) {
				return { edit: { result: 'aborted' } };
			}
			var editParams = typeof returnVal === 'object' ? returnVal : {
				text: String(returnVal)
			};
			return this.request(merge({
				action: 'edit',
				formatversion: '2',
				basetimestamp: basetimestamp,
				starttimestamp: curtimestamp,
				nocreate: !0,
				token: this.csrfToken
			}, makeTitle(title), editParams));

		}).then(data => {
			return data.edit;
		}, errorCode => {
			if (errorCode === 'editconflict' && conflictRetries > 0) {
				return this.edit(title, transform, conflictRetries - 1);
			}
		});
	}

	/**
	 * Edit a page without loading it first. Straightforward version of `edit`.
	 * No edit conflict detection.
	 *
	 * @param {string|number}  title - title or pageid (as number)
	 * @param {string}  content
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	save(title, content, summary, options) {
		return this.request(merge({
			action: 'edit',
			text: content,
			summary: summary,
			token: this.csrfToken
		}, makeTitle(title), options)).then(data => data.edit);
	}

	/**
	 * Creates a new pages. Does not edit existing ones
	 *
	 * @param {string}  title
	 * @param {string}  content
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 *
	 * @returns {Promise}
	 */
	create(title, content, summary, options) {
		return this.request(merge({
			action: 'edit',
			title: String(title),
			text: content,
			summary: summary,
			createonly: true,
			token: this.csrfToken
		}, options)).then(data => data.edit);
	}

	/**
	 * Post a new section to the page.
	 *
	 * @param {string|number} title - title or pageid (as number)
	 * @param {string} header
	 * @param {string} message wikitext message
	 * @param {Object} [additionalParams] Additional API parameters, e.g. `{ redirect: true }`
	 * @return {Promise}
	 */
	newSection(title, header, message, additionalParams) {
		return this.request(merge({
			action: 'edit',
			section: 'new',
			summary: header,
			text: message,
			token: this.csrfToken
		}, makeTitle(title), additionalParams)).then(data => data.edit);
	}

	/**
	 * Reads the content / and meta-data of one (or many) pages
	 *
	 * @param {string|string[]|number|number[]} titles - for multiple pages use an array
	 * @param {object} [options]
	 *
	 * @returns {Promise}
	 */
	read(titles, options) {
		return this.massQuery(merge({
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			redirects: '1'
		}, makeTitles(titles), options),
		typeof titles[0] === 'number' ? 'pageids' : 'titles').then(jsons => {
			var data = jsons.reduce((data, json) => {
				return data.concat(json.query.pages);
			}, []);
			return data.length === 1 ? data[0] : data;
		});
	}

	/**
	 * Deletes a page
	 *
	 * @param {string|number}  title - title or pageid (as number)
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	delete(title, summary, options) {
		return this.request(merge({
			action: 'delete',
			reason: summary,
			token: this.csrfToken
		}, makeTitle(title), options)).then(data => data.delete);
	}

	/**
	 * Undeletes a page.
	 * Note: all deleted revisions of the page will be restored.
	 *
	 * @param {string}  title
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	undelete(title, summary, options) {
		return this.request(merge({
			action: 'undelete',
			title: String(title),
			reason: summary,
			token: this.csrfToken
		}, options)).then(data => data.undelete);
	}

	/**
	 * Moves a new page
	 *
	 * @param {string}  fromtitle
	 * @param {string}  totitle
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	move(fromtitle, totitle, summary, options) {
		return this.request(merge({
			action: 'move',
			from: fromtitle,
			to: totitle,
			reason: summary,
			movetalk: 1,
			token: this.csrfToken
		}, options)).then(data => data.move);
	}

	/**
	 * Parse wikitext. Convenience method for 'action=parse'.
	 *
	 * @param {string} content Content to parse.
	 * @param {Object} additionalParams Parameters object to set custom settings, e.g.
	 *   redirects, sectionpreview.  prop should not be overridden.
	 * @return {Promise<string>}
	 */
	parseWikitext(content, additionalParams) {
		return this.request(merge({
			text: String(content),
			formatversion: 2,
			action: 'parse',
			contentmodel: 'wikitext'
		}, additionalParams)).then(function(data) {
			return data.parse.text;
		});
	}

	/**
	 * Parse a given page. Convenience method for 'action=parse'.
	 *
	 * @param {string} title Title of the page to parse
	 * @param {Object} additionalParams Parameters object to set custom settings, e.g.
	 *   redirects, sectionpreview.  prop should not be overridden.
	 * @return {Promise<string>}
	 */
	parseTitle(title, additionalParams) {
		return this.request(merge({
			page: String(title),
			formatversion: 2,
			action: 'parse',
			contentmodel: 'wikitext'
		}, additionalParams)).then( function ( data ) {
			return data.parse.text;
		});
	}

	/**
	 * Upload an image from a web URL to the wiki
	 * If a file with the same name exists, it will be over-written,
	 * to disable this behaviour, use `ignorewarning: false` in options.
	 * @param {string} url
	 * @param {string} title
	 * @param {string} text
	 * @param {Object} options
	 */
	uploadFromUrl(url, title, text, options) {
		return this.request(merge({
			action: 'upload',
			url: url,
			filename: title || path.basename(url),
			text: text,
			ignorewarnings: '1',
			token: this.csrfToken
		}, options)).then(data => {
			return data.upload;
		});
	}

	/**
	 * Download an image from the wiki.
	 * If you're downloading multiple images, then for better efficiency, you may want
	 * to query the API for the urls of all images in one request, and follow that with
	 * running downloadFromUrl for each one.
	 * @param {string|number} file - title or page ID
	 * @param {string} [localname] - local path (with file name) to download to,
	 * defaults to current directory with same file name as on the wiki.
	 * @returns {Promise<void>}
	 */
	download(file, localname) {
		return this.request(merge({
			action: 'query',
			prop: 'imageinfo',
			iiprop: 'url'
		}, makeTitles(file))).then(data => {
			var url = data.query.pages[0].imageinfo[0].url;
			var name = new this.title(data.query.pages[0].title).getMainText();
			return this.downloadFromUrl(url, localname || name);
		});
	}

	/**
	 * Download an image from a URL.
	 * @param {string} url
	 * @param {string} [localname] - local path (with file name) to download to,
	 * defaults to current directory with same file name as that of the web image.
	 * @returns {Promise<void>}
	 */
	downloadFromUrl(url, localname) {
		return this.rawRequest({
			method: 'get',
			url: url,
			responseType: 'stream'
		}).then(response => {
			response.pipe(fs.createWriteStream(localname || path.basename(url)));
		});
	}

	/**
	 * Convenience method for `action=rollback`.
	 *
	 * @param {string|number} page - page title or page id as number or Title object
	 * @param {string} user
	 * @param {Object} [params] Additional parameters
	 * @return {Promise}
	 */
	rollback(page, user, params) {
		return this.request({
			action: 'query',
			meta: 'tokens',
			type: 'rollback'
		}).then(data => {
			return this.request(merge({
				action: 'rollback',
				user: user,
				token: data.query.tokens.rollbacktoken
			}, makeTitle(page), params));
		}).then(data => {
			return data.rollback;
		});
	}

	/**
	 * Purge one or more pages (max 500 for bots, 50 for others)
	 *
	 * @param {String[]|String|number[]|number} titles - page titles or page ids
	 * @param {Object} options
	 * @returns {Promise}
	 */
	purge(titles, options) {
		return this.request(merge({
			action: 'purge',
		}, makeTitles(titles), options)).then(data => data.purge);
	}

	/**
	 * Get pages with names beginning with a given prefix
	 * @param {string} prefix
	 * @param {Object} otherParams
	 *
	 * @returns {Promise<string[]>} - array of page titles (upto 5000 or 500)
	 */
	getPagesByPrefix(prefix, otherParams) {
		var title = Title.newFromText(prefix);
		if (!title) {
			throw new Error('invalid prefix for getPagesByPrefix');
		}
		return this.request(merge({
			"action": "query",
			"list": "allpages",
			"apprefix": title.title,
			"apnamespace": title.namespace,
			"aplimit": "max"
		}, otherParams)).then((data) => {
			return data.query.allpages.map(pg => pg.title);
		});
	}

	/**
	 * Get pages in a category
	 * @param {string} category - name of category, with or without namespace prefix
	 * @param {Object} [otherParams]
	 * @returns {Promise<string[]>}
	 */
	getPagesInCategory(category, otherParams) {
		var title = Title.newFromText(category, 14);
		return this.request(merge({
			"action": "query",
			"list": "categorymembers",
			"cmtitle": title.toText(),
			"cmlimit": "max"
		}, otherParams));
	}

	/************* BULK PROCESSING FUNCTIONS ************/


	/**
	 * Send an API query that automatically continues till the limit is reached.
	 *
	 * @param {Object} query - The API query
	 * @param {number} [limit=10] - limit on the maximum number of API calls to go through
	 * @returns {Promise<Object[]>} - resolved with an array of responses of individual calls.
	 */
	continuedQuery(query, limit=10) {
		var responses = [];
		var callApi = (query, count) => {
			return this.request(query).then(response => {
				if (!this.options.silent) {
					log(`[+] Got part ${count} of continuous API query`);
				}
				responses.push(response);
				if (response.continue && count < limit) {
					return callApi(merge(query, response.continue), count + 1);
				} else {
					return responses;
				}
			});
		};
		return callApi(query, 1);
	}

	/**
	 * Function for using API action=query with more than 50/500 items in multi-
	 * input fields.
	 *
	 * Multi-value fields in the query API take multiple inputs as an array
	 * (internally converted to a pipe-delimted string) but with a limit of 500
	 * (or 50 for users without apihighlimits).
	 * Example: the fields titles, pageids and revids in any query, ususers in
	 * list=users.
	 *
	 * This function allows you to send a query as if this limit didn't exist.
	 * The array given to the multi-input field is split into batches and individual
	 * queries are sent sequentially for each batch.
	 * A promise is returned finally resolved with the array of responses of each
	 * API call.
	 *
	 * This assumes that the user has the apihighlimits user right, available to bots
	 * and sysops by default. If your account does not have the right, you MUST set
	 * `hasApiHighLimit` false using bot.setOptions() or in the bot constructor, failing
	 * which you'll get `toomanyvalues` API error.
	 *
	 * @param {Object} query - the query object, the multi-input field should
	 * be an array
	 * @param {string} [batchFieldName=titles] - the name of the multi-input field
	 *
	 * @returns {Promise<Object[]>} - promise resolved when all the API queries have
	 * settled, with the array of responses.
	 */
	massQuery(query, batchFieldName='titles') {
		var batchValues = query[batchFieldName];
		var limit = this.options.hasApiHighLimit ? 500 : 50;
		var numBatches = Math.ceil(batchValues.length / limit);
		var batches = new Array(numBatches);
		for (let i = 0; i < numBatches - 1; i++) {
			batches[i] = new Array(limit);
		}
		batches[numBatches - 1] = new Array(batchValues.length % limit);
		for (let i = 0; i < batchValues.length; i++) {
			batches[Math.floor(i/limit)][i % limit] = batchValues[i];
		}
		var responses = new Array(numBatches);
		return new Promise((resolve) => {
			var sendQuery = (idx) => {
				if (idx === numBatches) {
					return resolve(responses);
				}
				query[batchFieldName] = batches[idx];
				this.request(query).then(response => {
					responses[idx] = response;
				}, err => {
					if (err.code === 'toomanyvalues') {
						throw new Error(`[mwn] Your account doesn't have apihighlimit right.` +
						` Set the option hasApiHighLimit as false`);
					}
					responses[idx] = err;
				}).finally(() => {
					sendQuery(idx + 1);
				});
			};
			sendQuery(0);
		});
	}

	/**
	 * Execute an asynchronous function on a large number of pages (or other arbitrary
	 * items). Designed for working with promises.
	 *
	 * @param {Array} list - list of items to execute actions upon. The array would
	 * usually be of page names (strings).
	 * @param {Function} worker - function to execute upon each item in the list. Must
	 * return a promise.
	 * @param {number} [concurrency=5] - number of concurrent operations to take place.
	 * Set this to 1 for sequential operations. Default 5. Set this according to how
	 * expensive the API calls made by worker are.
	 * @param {number} [retries=0] - max number of times failing actions should be retried.
	 * @returns {Promise<Object>} - resolved when all API calls have finished, with object
	 * { failures: [ ...list of failed items... ] }
	 */
	batchOperation(list, worker, concurrency=5, retries=0) {
		var counts = {
			successes: 0,
			failures: 0
		};
		var failures = [];
		var incrementSuccesses = () => {
			counts.successes++;
		};
		var incrementFailures = (idx) => {
			counts.failures++;
			failures.push(list[idx]);
		};
		var updateStatusText = () => {
			var percentageFinished = Math.round((counts.successes + counts.failures) / list.length * 100);
			var percentageSuccesses = Math.round(counts.successes / (counts.successes + counts.failures) * 100);
			var statusText = `[+] Finished ${counts.successes + counts.failures}/${list.length} (${percentageFinished}%) tasks, of which ${counts.successes} (${percentageSuccesses}%) were successful, and ${counts.failures} failed.`;
			if (!this.options.silent) {
				log(statusText);
			}
		};
		var numBatches = Math.ceil(list.length / concurrency);

		return new Promise((resolve) => {
			var sendBatch = (batchIdx) => {

				// Last batch
				if (batchIdx === numBatches - 1) {

					var numItemsInLastBatch = list.length - batchIdx * concurrency;
					var finalBatchPromises = new Array(numItemsInLastBatch);

					// Hack: Promise.allSettled requires NodeJS 12.9+
					// so we create a new array finalBatchSettledPromises containing promises
					// which are resolved irrespective of whether the corresponding
					// finalBatchPromises are resolved or rejected.
					var finalBatchSettledPromises = new Array(numItemsInLastBatch);

					for (let i = 0; i < numItemsInLastBatch; i++) {
						let idx = batchIdx * concurrency + i;
						finalBatchPromises[i] = worker(list[idx], idx);
						if (!ispromise(finalBatchPromises[i])) {
							throw new Error('batchOperation worker function must return a promise');
						}
						finalBatchSettledPromises[i] = new Promise((resolve) => {
							return finalBatchPromises[i].then(resolve, resolve);
						});
						finalBatchPromises[i].then(incrementSuccesses, incrementFailures.bind(null, idx))
							.finally(function() {
								updateStatusText();
								finalBatchSettledPromises[i] = Promise.resolve();
							});
					}
					Promise.all(finalBatchSettledPromises).then(() => {
						if (counts.failures !== 0 && retries > 0) {
							resolve(this.batchOperation(failures, worker, concurrency, retries - 1));
						} else {
							resolve({ failures });
						}
					});
					return;
				}

				for (let i = 0; i < concurrency; i++) {
					let idx = batchIdx * concurrency + i;

					var promise = worker(list[idx], idx);
					if (!ispromise(promise)) {
						throw new Error('batchOperation worker function must return a promise');
					}
					promise.then(incrementSuccesses, incrementFailures.bind(null, idx)).finally(() => {
						updateStatusText();
						// last item in batch: trigger the next batch's API calls
						if (i === concurrency - 1) {
							sendBatch(batchIdx + 1);
						}
					});
				}

			};
			sendBatch(0);
		});
	}

	/**
	 * Execute an asynchronous function on a number of pages (or other arbitrary items)
	 * sequentially, with a time delay between actions.
	 * Using this with delay=0 is same as using ApiBatchOperation with batchSize=1
	 * @param {Array} list
	 * @param {Function} worker - must return a promise
	 * @param {number} [delay=5000] - number of milliseconds of delay
	 * @param {number} [retries=0] - max number of times failing actions should be retried.
	 * @returns {Promise<Object>} - resolved when all API calls have finished, with object
	 * { failures: [ ...list of failed items... ] }
	 */
	seriesBatchOperation(list, worker, delay=5000, retries=0) {
		var counts = {
			successes: 0,
			failures: 0
		};
		var failures = [];
		var incrementSuccesses = () => {
			counts.successes++;
		};
		var incrementFailures = (idx) => {
			counts.failures++;
			failures.push(list[idx]);
		};
		var updateStatusText = () => {
			var percentageFinished = Math.round((counts.successes + counts.failures) / list.length * 100);
			var percentageSuccesses = Math.round(counts.successes / (counts.successes + counts.failures) * 100);
			var statusText = `[+] Finished ${counts.successes + counts.failures}/${list.length} (${percentageFinished}%) tasks, of which ${counts.successes} (${percentageSuccesses}%) were successful, and ${counts.failures} failed.`;
			if (!this.options.silent) {
				log(statusText);
			}
		};

		return new Promise((resolve) => {
			var trigger = (idx) => {
				if (list[idx] === undefined) { // reached the end
					if (counts.failures !== 0 && retries > 0) {
						return resolve(this.seriesBatchOperation(failures, worker, delay, retries - 1));
					} else {
						return resolve({ counts, failures });
					}
				}
				var promise = worker(list[idx], idx);
				if (!ispromise(promise)) {
					throw new Error('seriesBatchOperation worker function must return a promise');
				}
				promise.then(incrementSuccesses, incrementFailures.bind(null, idx))
					.finally(function() {
						updateStatusText();
						setTimeout(function() {
							trigger(idx + 1);
						}, delay);
					});
			};
			trigger(0);
		});
	}


	/********** SUPPLEMENTARY FUNCTIONS **************/


	/**
	 * Execute an ASK Query
	 * On a wiki that supports them, like semantic-mediawiki
	 *
	 * @param {string} query
	 * @param {string} [apiUrl]
	 * @param {object} [customRequestOptions]
	 *
	 * @returns {Promise}
	 */
	askQuery(query, apiUrl, customRequestOptions) {

		apiUrl = apiUrl || this.options.apiUrl;

		let requestOptions = merge({
			method: 'get',
			url: apiUrl,
			responseType: 'json',
			params: {
				action: 'ask',
				format: 'json',
				query: query
			}
		}, customRequestOptions);

		return this.rawRequest(requestOptions);
	}


	/**
	 * Executes a SPARQL Query
	 * On a wiki that supports them, like wikidata
	 *
	 * @param {string} query
	 * @param {string} [endpointUrl]
	 * @param {object} [customRequestOptions]
	 *
	 * @returns {Promise}
	 */
	sparqlQuery(query, endpointUrl, customRequestOptions) {

		endpointUrl = endpointUrl || this.options.apiUrl;

		let requestOptions = merge({
			method: 'get',
			url: endpointUrl,
			responseType: 'json',
			params: {
				format: 'json',
				query: query
			}
		}, customRequestOptions);

		return this.rawRequest(requestOptions);
	}

	/**
	 * Gets ORES predictions from revision IDs
	 * @param {string} endpointUrl
	 * @param {string[]|string} models
	 * @param {string[]|number[]|string|number} revision ID(s)
	 */
	oresQueryRevisions(endpointUrl, models, revisions) {
		var response = {};
		var chunks = arrayChunk(
			(revisions instanceof Array) ? revisions : [ revisions ],
			50
		);
		return this.seriesBatchOperation(chunks, (chunk) => {
			return this.rawRequest({
				method: 'get',
				url: endpointUrl,
				params: {
					models: models.join('|'),
					revids: chunk.join('|')
				},
				responseType: 'json'
			}).then(data => {
				Object.assign(response, Object.values(data)[0].scores);
			});
		}, 0, 2).then(() => {
			return response;
		});
	}


	/****************** UTILITIES *****************/

	/**
	 * Prints status information about a completed request
	 *
	 * @param status
	 * @param currentCounter
	 * @param totalCounter
	 * @param operation
	 * @param pageName
	 * @param reason
	 */
	static logStatus(status, currentCounter, totalCounter, operation, pageName, reason) {

		operation = operation || '';

		if (operation) {
			operation = ' [' + operation.toUpperCase() + ']';
			operation = (operation + '            ').substring(0, 12); // Right space padding: http://stackoverflow.com/a/24398129
		}

		reason = reason || '';
		if (reason) {
			reason = ' (' + reason + ')';
		}

		log(status + '[' + semlog.pad(currentCounter, 4) + '/' + semlog.pad(totalCounter, 4) + ']' + operation + pageName + reason);
	}
}

// Bind static utilities
Object.assign(Bot, static_utils);

/**
 * Simple wrapper around Object.assign to merge objects. null and undefined
 * arguments in argument list will be ignored.
 *
 * @param {...Object} objects - if the same property exists on multiple
 * objects, the value on the rightmost one will be kept in the output.
 * @returns {Object} - Merged object
 */
var merge = function(...objects) {
	// {} used as first parameter as this object is mutated by default
	return Object.assign({}, ...objects);
};

/**
 * Merge objects deeply to 1 level. Object properties like params, form,
 * header get merged. But not any object properties within them.
 * Arrays are not merged, but over-written (as if it were a primitive)
 * The original object is mutated and returned.
 */
var mergeRequestOptions = function(options, customOptions) {
	Object.entries(customOptions).forEach(([key, val]) => {
		if (typeof val === 'object' && !Array.isArray(val)) {
			options[key] = merge(options[key], val);
			// this can't be written as Object.assign(options[key], val)
			// as options[key] could be undefined
		} else {
			options[key] = val;
		}
	});
	return options;
};

/** @param {Array} arr, @param {number} size */
var arrayChunk = function(arr, size) {
	var numChunks = Math.ceil(arr.length / size);
	var result = new Array(numChunks);
	for (let i=0; i<numChunks; i++) {
		result[i] = arr.slice(i * size, (i + 1) * size);
	}
	return result;
};

/**
 * Promisified version of setTimeout
 * @param {number} duration - of sleep in milliseconds
 */
var sleep = function(duration) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};

var makeTitles = function(pages) {
	pages = Array.isArray(pages) ? pages : [ pages ];
	if (typeof pages[0] === 'number') {
		return { pageids: pages };
	} else {
		// .join casts array elements to strings and then joins
		return { titles: pages };
	}
};

var makeTitle = function(page) {
	if (typeof page === 'number') {
		return { pageid: page };
	} else {
		return { title: String(page) };
	}
};

module.exports = Bot;
