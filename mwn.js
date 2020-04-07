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
 *  <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.api>
 * released under GNU GPL v2.
 *
 */

'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const semlog = require('semlog');

const log = semlog.log;

class mwn {


	/***************** CONSTRUCTOR ********************/

	/**
	 * Constructs a new mwn instance
	 * It is advised to create one bot instance for every API to use
	 * A bot instance has its own state (e.g. tokens) that is necessary for some operations
	 *
	 * @param {Object} [customOptions]        Custom options
	 * @param {Object} [customRequestOptions] Custom request options
	 */
	constructor(customOptions, customRequestOptions) {

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
		 * Bot instances edit token
		 *
		 * @type {boolean}
		 */
		this.editToken = false;

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
			// verbose: false,
			silent: false,
			// concurrency: 1,
			apiUrl: false
		};

		/**
		 * Custom options as the user provided them originally.
		 *
		 * @type {object}
		 */
		this.customOptions = customOptions || {};

		/**
		 * Actual, current options of the bot instance
		 * They're a mix of the default options, the custom options and later changes
		 *
		 * @type {Object}
		 */
		this.options = merge(this.defaultOptions, this.customOptions);

		/**
		 * Default options for the NPM request library
		 *
		 * @type {Object}
		 */
		this.defaultRequestOptions = {
			method: 'POST',
			headers: {
				'User-Agent': 'mwn'
			},
			qs: {
				format: 'json',
				formatversion: '2'
			},
			form: {

			},
			timeout: 120000, // 120 seconds
			jar: true,
			time: true,
			json: true
		};

		/**
		 * Custom request options
		 *
		 * @type {Object}
		 */
		this.customRequestOptions = customRequestOptions || {};

		/**
		 * The actual, current options for the NPM request library
		 *
		 * @type {Object}
		 */
		this.globalRequestOptions = merge(this.defaultRequestOptions, this.customRequestOptions);

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
		this.customOptions = merge(this.customOptions, customOptions);
	}

	/**
	 * Sets and overwrites the raw request options, used by the "request" library
	 * See https://www.npmjs.com/package/request
	 *
	 * @param {Object} customRequestOptions
	 */
	setGlobalRequestOptions(customRequestOptions) {
		this.globalRequestOptions = merge(this.globalRequestOptions, customRequestOptions);
		this.customRequestOptions = merge(this.customRequestOptions, customRequestOptions);
	}

	/**
	 * Sets the API URL for MediaWiki requests
	 * This can be uses instead of a login, if no actions are used that require login.
	 *
	 * @param {String}  apiUrl  API Url to MediaWiki, e.g. 'https://www.semantic-mediawiki.org/w/api.php'
	 */
	setApiUrl(apiUrl) {
		this.options.apiUrl = apiUrl;
	}

	/************ CORE REQUESTS ***************/

	/**
	 * Executes a promisified raw request
	 * Uses the npm request library
	 *
	 * @param {object} requestOptions
	 *
	 * @returns {Promise}
	 */
	rawRequest(requestOptions) {

		this.counter.total += 1;

		return new Promise((resolve, reject) => {
			this.counter.resolved += 1;
			if (!requestOptions.uri) {
				this.counter.rejected += 1;
				return reject(new Error('No URI provided!'));
			}
			request(requestOptions, (error, response, body) => {
				if (error) {
					this.counter.rejected +=1;
					return reject(error);
				} else {
					this.counter.fulfilled +=1;
					return resolve(body);
				}
			});
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

		// pre-process params:
		// copied from mw.Api().preprocessParameters
		for (var key in params) {
			if (Array.isArray(params[key])) {
				if (params[key].join('').indexOf('|') === -1) {
					params[key] = params[key].join('|');
				} else {
					params[key] = '\x1f' + params[key].join('\x1f');
				}
			} else if (params[key] === false || params[key] === undefined) {
				delete params[key];
			}
		}

		return new Promise((resolve, reject) => {

			this.globalRequestOptions.uri = this.options.apiUrl; // XXX: ??

			let requestOptions = merge(this.globalRequestOptions, customRequestOptions);
			requestOptions.form = merge(requestOptions.form, params);

			this.rawRequest(requestOptions).then((response) => {

				if (typeof response !== 'object') {
					let err = new Error('invalidjson: No valid JSON response');
					err.code = 'invalidjson';
					err.info = 'No valid JSON response';
					err.response = response;
					return reject(err) ;
				}

				if (response.error) { // See https://www.mediawiki.org/wiki/API:Errors_and_warnings#Errors
					let err = new Error(response.error.code + ': ' + response.error.info);
					// Enhance error object with additional information
					err.errorResponse = true;
					err.code = response.error.code;
					err.info = response.error.info;
					err.response = response;
					err.request = requestOptions;
					return reject(err) ;
				}

				return resolve(response);

			}).catch((err) => {
				reject(err);
			});

		});
	}


	/************** CORE FUNCTIONS *******************/


	/**
	 * Executes a Login
	 *
	 * @see https://www.mediawiki.org/wiki/API:Login
	 *
	 * @param {object} [loginOptions]
	 *
	 * @returns {Promise}
	 */
	login(loginOptions) {

		this.loginPromise = new Promise((resolve, reject) => {

			this.options = merge(this.options, loginOptions);

			if (!this.options.username || !this.options.password || !this.options.apiUrl) {
				return reject(new Error('Incomplete login credentials!'));
			}

			let loginRequest = {
				action: 'login',
				lgname: this.options.username,
				lgpassword: this.options.password
			};

			let loginString = this.options.username + '@' + this.options.apiUrl.split('/api.php').join('');

			this.request(loginRequest).then((response) => {

				if (!response.login || !response.login.result) {
					let err = new Error('Invalid response from API');
					err.response = response;
					log('[E] [mwn] Login failed with invalid response: ' + loginString);
					return reject(err) ;
				}

				this.state = merge(this.state, response.login);

				// Add token and re-submit login request
				loginRequest.lgtoken = response.login.token;
				return this.request(loginRequest);

			}).then((response) => {

				if (response.login && response.login.result === 'Success') {
					this.state = merge(this.state, response.login);
					this.loggedIn = true;
					if (!this.options.silent) {
						log('[S] [mwn] Login successful: ' + loginString);
					}
					return resolve(this.state);
				}

				let reason = 'Unknown reason';
				if (response.login && response.login.result) {
					reason = response.login.result;
				}
				let err = new Error('Could not login: ' + reason);
				err.response = response;
				log('[E] [mwn] Login failed: ' + loginString);
				return reject(err) ;

			}).catch((err) => {
				reject(err);
			});

		});

		return this.loginPromise;
	}

	/**
	 * Gets an edit token
	 * This is currently only compatible with MW >= 1.24
	 *
	 * @returns {Promise}
	 */
	getEditToken() {
		return new Promise((resolve, reject) => {

			if (this.editToken) {
				return resolve(this.state);
			}

			// MW >= 1.24
			this.request({
				action: 'query',
				meta: 'tokens',
				type: 'csrf'
			}).then((response) => {
				if (response.query && response.query.tokens && response.query.tokens.csrftoken) {
					this.editToken = response.query.tokens.csrftoken;
					this.state = merge(this.state, response.query.tokens);
					return resolve(this.state);
				} else {
					let err = new Error('Could not get edit token');
					err.response = response;
					return reject(err) ;
				}
			}).catch((err) => {
				return reject(err);
			});
		});
	}

	/**
	 * Combines Login  with GetEditToken
	 *
	 * @param loginOptions
	 * @returns {Promise}
	 */
	loginGetEditToken(loginOptions) {
		return this.login(loginOptions).then(() => {
			return this.getEditToken();
		});
	}

	/***************** HELPER FUNCTIONS ******************/


	/**
	* @param {string} title Page title
	* @param {Function} transform Callback that prepares the edit
	* @param {Object} transform.revision Current revision
	* @param {string} transform.revision.content Current revision content
	* @param {string|Object|Promise} transform.return New content, object with edit
	*  API parameters, or promise providing one of those.
	* @return {Promise} Edit API response
	*/
	// copied from mw.Api().edit, with promises used instead of jQuery
	edit(title, transform) {
		var basetimestamp, curtimestamp, bot = this;
		title = String(title);
		return bot.request({
			action: 'query',
			prop: 'revisions',
			rvprop: ['content', 'timestamp'],
			titles: [title],
			formatversion: '2',
			curtimestamp: !0
		}).then(function(data) {
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
		}).then(function(params) {
			var editParams = typeof params === 'object' ? params : {
				text: String(params)
			};
			return bot.request(merge({
				action: 'edit',
				title: title,
				formatversion: '2',
				basetimestamp: basetimestamp,
				starttimestamp: curtimestamp,
				nocreate: !0,
				token: bot.editToken
			}, editParams));
		}).then(function(data) {
			return data.edit;
		});
	}

	/**
	 * Edit a page without loading it first. Straightforward version of `edit`.
	 * No edit conflict detection.
	 *
	 * @param {string}  title
	 * @param {string}  content
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	save(title, content, summary, options) {
		return this.request(merge({
			action: 'edit',
			title: title,
			text: content,
			summary: summary,
			token: this.editToken
		}, options)).then(data => data.edit);
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
			title: title,
			text: content,
			summary: summary,
			createonly: true,
			token: this.editToken
		}, options)).then(data => data.edit);
	}

	/**
	 * Post a new section to the page.
	 *
	 * @param {string} title Target page
	 * @param {string} header
	 * @param {string} message wikitext message
	 * @param {Object} [additionalParams] Additional API parameters, e.g. `{ redirect: true }`
	 * @return {jQuery.Promise}
	 */
	newSection(title, header, message, additionalParams) {
		return this.request( merge( {
			action: 'edit',
			section: 'new',
			title: String( title ),
			summary: header,
			text: message,
			token: this.editToken
		}, additionalParams ) ).then(data => data.edit);
	}

	/**
	 * Reads the content / and meta-data of one (or many) pages
	 *
	 * @param {string|string[]}  titles    For multiple Pages use an array
	 * @param {object}      [options]
	 *
	 * @returns {Promise}
	 */
	read(titles, options) {
		return this.request(merge({
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			titles: titles,
			redirects: '1'
		}, options)).then(data => {
			if (Array.isArray(titles)) {
				return data.query.pages;
			} else {
				return data.query.pages[0];
			}
		});
	}

	/**
	 * Deletes a page
	 *
	 * @param {string}  title
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	delete(title, summary, options) {
		return this.request(merge({
			action: 'delete',
			title: title,
			reason: summary,
			token: this.editToken
		}, options)).then(data => data.delete);
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
			title: title,
			reason: summary,
			token: this.editToken
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
			token: this.editToken
		}, options)).then(data => data.move);
	}

	/**
	 * Parse wikitext. Convenience method for 'action=parse'.
	 *
	 * @param {string} content Content to parse.
	 * @param {Object} additionalParams Parameters object to set custom settings, e.g.
	 *   redirects, sectionpreview.  prop should not be overridden.
	 * @return {Promise}
	 * @return {Function} return.then
	 * @return {string} return.then.data Parsed HTML of `wikitext`.
	 */
	parseWikitext(content, additionalParams) {
		return this.request(merge({
			text: String(content),
			formatversion: 2,
			action: 'parse',
			contentmodel: 'wikitext'
		}, additionalParams)).then(function (data) {
			return data.parse.text;
		});
	}

	/**
	 * Parse a given page. Convenience method for 'action=parse'.
	 *
	 * @param {string} title Title of the page to parse
	 * @param {Object} additionalParams Parameters object to set custom settings, e.g.
	 *   redirects, sectionpreview.  prop should not be overridden.
	 * @return {Promise}
	 * @return {Function} return.then
	 * @return {string} return.then.data Parsed HTML of `wikitext`.
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
	 * Convenience method for `action=rollback`.
	 *
	 * @param {string} page
	 * @param {string} user
	 * @param {Object} [params] Additional parameters
	 * @return {Promise}
	 */
	rollback(page, user, params) {
		var bot = this;
		return this.request({
			action: 'query',
			meta: 'tokens',
			type: 'rollback'
		}).then(function(data) {
			return bot.request(merge({
				action: 'rollback',
				title: String( page ),
				user: user,
				token: data.query.tokens.rollbacktoken
			}, params));
		}).then(function(data) {
			return data.rollback;
		});
	}

	/**
	 * Uploads a file
	 *
	 * @param {string}  [title]
	 * @param {string}  pathToFile
	 * @param {string}  [comment]
	 * @param {object}  [customParams]
	 * @param {object}  [customRequestOptions]
	 *
	 * @returns {Promise}
	 */
	upload(title, pathToFile, comment, customParams, customRequestOptions) {

		try {
			let file = fs.createReadStream(pathToFile);

			let params = merge({
				action: 'upload',
				filename: title || path.basename(pathToFile),
				file: file,
				comment: comment || '',
				token: this.editToken
			}, customParams);

			let uploadRequestOptions = merge(this.globalRequestOptions, {

				// https://www.npmjs.com/package/request#support-for-har-12
				har: {
					method: 'POST',
					postData: {
						mimeType: 'multipart/form-data',
						params: []
					}
				}
			});

			// Convert params to HAR 1.2 notation
			for (let paramName in params) {
				let param = params[paramName];
				uploadRequestOptions.har.postData.params.push({
					name: paramName,
					value: param
				});
			}

			let requestOptions = merge(uploadRequestOptions, customRequestOptions);

			return this.request({}, requestOptions);

		} catch (e) {
			return Promise.reject(e);
		}
	}

	/**
	 * Uploads a file and overwrites existing ones
	 *
	 * @param {string}  [title]
	 * @param {string}  pathToFile
	 * @param {string}  [comment]
	 * @param {object}  [customParams]
	 * @param {object}  [customRequestOptions]
	 *
	 * @returns {Promise}
	 */
	uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions) {
		let params = merge({
			ignorewarnings: ''
		}, customParams);
		return this.upload(title, pathToFile, comment, params, customRequestOptions);
	}


	/************* BULK PROCESSING FUNCTIONS ************/


	/**
	 * Send an API query that automatically continues till the limit is reached.
	 *
	 * @param {Object} query - The API query
	 * @param {number} [limit=10] - limit on the maximum number of API calls to go through
	 * @returns {Promise<Object[]>} - resolved with an array of responses of individual calls.
	 */
	continuousQuery(query, limit) {
		limit = limit || 10;
		var responses = [];
		var callApi = function(query, count) {
			return this.request(query).then(function(response) {
				if (!this.options.silent) {
					log(`[+] Got part ${count} of continuous API query`);
				}
				responses.push(response);
				if (response.continue && count < limit) {
					return callApi(Object.assign({}, query, response.continue), count + 1);
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
	 * Several fields in the query API take multiple inputs but with a limit of
	 * 50 (or 500 for users with highapilimits).
	 * Example: the fields titles, pageids and revids in any query, ususers in
	 * list=users, etc.
	 *
	 * This function allows you to send a query as if this limit didn't exist.
	 * The array given to the multi-input field is split into batches of 50
	 * (500 for bots) and individual queries are sent sequentially for each batch.
	 * A promise is returned finally resolved with the array of responses of each
	 * API call.
	 *
	 * XXX: limits of 50 or 500 could be wiki-specific.
	 *
	 * @param {Object} query - the query object, the multi-input field should
	 * be an array
	 * @param {string} [batchFieldName=titles] - the name of the multi-input field
	 * @param {boolean} [hasApiHighLimit=false] - set true to use api high limits
	 * available with bot or sysop accounts
	 * @returns {Promise<Object[]>} - promise resolved when all the API queries have
	 * settled, with the array of responses.
	 */
	massQuery(query, batchFieldName, hasApiHighLimit) {
		batchFieldName = batchFieldName || 'titles';
		var batchValues = query[batchFieldName];
		var limit = hasApiHighLimit ? 500 : 50;
		var numBatches = Math.ceil(batchValues.length / limit);
		var batches = new Array(numBatches);
		for (let i = 0; i < numBatches; i++) {
			batches[i] = new Array(limit);
		}
		for (let i = 0; i < batchValues.length; i++) {
			batches[Math.floor(i/limit)][i % limit] = batchValues[i];
		}
		var responses = new Array(numBatches);
		return new Promise(function(resolve) {
			var sendQuery = function(idx) {
				if (idx === numBatches) {
					resolve(responses);
					return;
				}
				query[batchFieldName] = batches[idx];
				this.request(query).then(function(response) {
					responses[idx] = response;
				}).finally(function() {
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
	 * @param {number} [batchSize=5] - number of concurrent operations to take place.
	 * Set this to 1 for sequential operations. Default 5. Set this according to how
	 * expensive the API calls made by worker are.
	 * @returns {Promise} - resolved when all API calls have finished.
	 */
	batchOperation(list, worker, batchSize) {
		batchSize = batchSize || 50;
		var successes = 0, failures = 0;
		var incrementSuccesses = function() { successes++; };
		var incrementFailures = function() { failures++; };
		var updateStatusText = function() {
			var percentageFinished = Math.round((successes + failures) / list.length * 100);
			var percentageSuccesses = Math.round(successes / (successes + failures) * 100);
			var statusText = `Finished ${successes + failures}/${list.length} (${percentageFinished}%) tasks, of which ${successes} (${percentageSuccesses}%) were successful, and ${failures} failed.`;
			if (!this.options.silent) {
				console.log(statusText);
			}
		};
		var numBatches = Math.ceil(list.length / batchSize);

		return new Promise(function(resolve) {
			var sendBatch = function(batchIdx) {
				if (batchIdx === numBatches - 1) { // last batch
					var numItemsInLastBatch = list.length - batchIdx * batchSize;
					var finalBatchPromises = new Array(numItemsInLastBatch);
					for (let i = 0; i < numItemsInLastBatch; i++) {
						let idx = batchIdx * batchSize + i;
						finalBatchPromises[i] = worker(list[idx], idx);
						finalBatchPromises[i].then(incrementSuccesses, incrementFailures).finally(updateStatusText);
					}
					// XXX: Promise.allSettled requires NodeJS 12.9+
					Promise.all(finalBatchPromises).then(resolve);
					return;
				}
				for (let i = 0; i < batchSize; i++) {
					let idx = batchIdx * batchSize + i;
					var promise = worker(list[idx], idx);
					promise.then(incrementSuccesses, incrementFailures).finally(updateStatusText);
					if (i === batchSize - 1) { // last item in batch: trigger the next batch's API calls
						promise.finally(function() {
							sendBatch(batchIdx + 1);
						});
					}
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
	 * @returns {Promise} - resolved when all API calls have finished
	 */
	seriesBatchOperation(list, worker, delay) {
		delay = delay || 5000;
		var successes = 0, failures = 0;
		var incrementSuccesses = function() { successes++; };
		var incrementFailures = function() { failures++; };
		var updateStatusText = function() {
			var percentageFinished = Math.round((successes + failures) / list.length * 100);
			var percentageSuccesses = Math.round(successes / (successes + failures) * 100);
			var statusText = `Finished ${successes + failures}/${list.length} (${percentageFinished}%) tasks, of which ${successes} (${percentageSuccesses}%) were successful, and ${failures} failed.`;
			if (!this.options.silent) {
				console.log(statusText);
			}
		};

		return new Promise(function(resolve) {
			var trigger = function(idx) {
				if (!list[idx]) {
					resolve();
					return;
				}
				return worker(list[idx])
					.then(incrementSuccesses, incrementFailures)
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
			method: 'GET',
			uri: apiUrl,
			json: true,
			qs: {
				action: 'ask',
				format: 'json',
				query: query
			}
		}, customRequestOptions);

		return this.rawRequest(requestOptions);
	}


	/**
	 * Executes a SPARQL Query
	 *
	 * @param {string} query
	 * @param {string} [apiUrl]
	 * @param {object} [customRequestOptions]
	 *
	 * @returns {Promise}
	 */
	sparqlQuery(query, endpointUrl, customRequestOptions) {

		endpointUrl = endpointUrl || this.options.apiUrl;

		let requestOptions = merge({
			method: 'GET',
			uri: endpointUrl,
			json: true,
			qs: {
				format: 'json',
				query: query
			}
		}, customRequestOptions);

		return this.rawRequest(requestOptions);
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

/**
 * Recursively merges two objects
 * Takes care that the two objects are not mutated
 *
 * @param {Object} parent   Parent Object
 * @param {Object} child    Child Object; overwrites parent properties
 * @returns {Object}        Merged Object
 */
var merge = function(parent, child) {
	parent = parent || {};
	child = child || {};
	// Use {} as first parameter, as this object is mutated by default
	// We don't want that, so we're providing an empty object that is thrown away after the operation
	return Object.assign({}, parent, child);
};

module.exports = mwn;
