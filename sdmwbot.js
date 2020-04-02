'use strict';

const fs            = require('fs');
const path          = require('path');
const request       = require('request');
const semlog        = require('semlog');
const log           = semlog.log;

/**
 * MWBot library
 *
 * @author Simon Heimler
 */
class MWBot {


    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    /**
     * Constructs a new MWBot instance
     * It is advised to create one bot instance for every API to use
     * A bot instance has its own state (e.g. tokens) that is necessary for some operations
     *
     * @param {{}} [customOptions]        Custom options
     * @param {{}} [customRequestOptions] Custom request options
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
         * Bot instances createaccount token
         *
         * @type {boolean}
         */
        this.createaccountToken = false;

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
            verbose: false,
            silent: false,
            defaultSummary: 'MWBot',
            concurrency: 1,
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
        this.options = MWBot.merge(this.defaultOptions, this.customOptions);

        /**
         * Default options for the NPM request library
         *
         * @type {Object}
         */
        this.defaultRequestOptions = {
            method: 'POST',
            headers: {
                'User-Agent': 'sdmwbot'
            },
            qs: {
                format: 'json'
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
         * @type {{}}
         */
        this.customRequestOptions = customRequestOptions || {};

        /**
         * The actual, current options for the NPM request library
         *
         * @type {Object}
         */
        this.globalRequestOptions = MWBot.merge(this.defaultRequestOptions, this.customRequestOptions);

        // SEMLOG OPTIONS
        semlog.updateConfig(this.options.semlog || {});
    }


    //////////////////////////////////////////
    // GETTER & SETTER                      //
    //////////////////////////////////////////

    /**
     * Set and overwrite mwbot options
     *
     * @param {Object} customOptions
     */
    setOptions(customOptions) {
        this.options = MWBot.merge(this.options, customOptions);
        this.customOptions = MWBot.merge(this.customOptions, customOptions);
    }

    /**
     * Sets and overwrites the raw request options, used by the "request" library
     * See https://www.npmjs.com/package/request
     *
     * @param {{}} customRequestOptions
     */
    setGlobalRequestOptions(customRequestOptions) {
        this.globalRequestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
        this.customRequestOptions = MWBot.merge(this.customRequestOptions, customRequestOptions);
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


    //////////////////////////////////////////
    // CORE REQUESTS                        //
    //////////////////////////////////////////

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
        // adapted from mw.Api().preprcoessParameters
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

            let requestOptions = MWBot.merge(this.globalRequestOptions, customRequestOptions);
            requestOptions.form = MWBot.merge(requestOptions.form, params);

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


    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

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

            this.options = MWBot.merge(this.options, loginOptions);

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
                    log('[E] [MWBOT] Login failed with invalid response: ' + loginString);
                    return reject(err) ;
                } else {
                    this.state = MWBot.merge(this.state, response.login);
                    // Add token and re-submit login request
                    loginRequest.lgtoken = response.login.token;
                    return this.request(loginRequest);
                }

            }).then((response) => {

                if (response.login && response.login.result === 'Success') {
                    this.state = MWBot.merge(this.state, response.login);
                    this.loggedIn = true;
                    log('[S] [MWBOT] Login successful: ' + loginString);
                    return resolve(this.state);
                } else {
                    let reason = 'Unknown reason';
                    if (response.login && response.login.result) {
                        reason = response.login.result;
                    }
                    let err = new Error('Could not login: ' + reason);
                    err.response = response;
                    log('[E] [MWBOT] Login failed: ' + loginString);
                    return reject(err) ;
                }

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
                    this.state = MWBot.merge(this.state, response.query.tokens);
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
     *
     * @returns {Promise}
     */
    loginGetEditToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getEditToken();
        });
    }

    /**
     * Gets a createaccount token
     * Requires MW 1.27+
     *
     * @returns {Promise}
     */
    getCreateaccountToken() {
        return new Promise((resolve, reject) => {

            if (this.createaccountToken) {
                return resolve(this.state);
            }

            // MW 1.27+
            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'createaccount'
            }).then((response) => {
                if (response.query && response.query.tokens && response.query.tokens.createaccounttoken) {
                    this.createaccountToken = response.query.tokens.createaccounttoken;
                    this.state = MWBot.merge(this.state, response.query.tokens);
                    return resolve(this.state);
                } else {
                    let err = new Error('Could not get createaccount token');
                    err.response = response;
                    return reject(err) ;
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }


    /**
     * Combines Login  with GetCreateaccountToken
     *
     * @param loginOptions
     *
     * @returns {Promise}
     */
    loginGetCreateaccountToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getCreateaccountToken();
        });
    }


    //////////////////////////////////////////
    // CRUD OPERATIONS                      //
    //////////////////////////////////////////

    /**
     * Creates a new wiki pages. Does not edit existing ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    create(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || this.options.defaultSummary,
            createonly: true,
            token: this.editToken
        }, customRequestOptions);
    }

    /**
     * Reads the content / and meta-data of one (or many) wikipages
     *
     * @param {string|string[]}  title    For multiple Pages use an array
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    read(title, customRequestOptions) {
        return this.request({
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            titles: title,
            redirects: 'yes'
        }, customRequestOptions);
    }

    /**
     * Edits a new wiki pages. Creates a new page if it does not exist yet.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    edit(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || this.options.defaultSummary,
            token: this.editToken
        }, customRequestOptions);
    }

    /**
     * Updates existing wiki pages. Does not create new ones.
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}      [customRequestOptions]
     *
     * @returns {Promise}
     */
    update(title, content, summary, customRequestOptions) {
        return this.request({
            action: 'edit',
            title: title,
            text: content,
            summary: summary || this.options.defaultSummary,
            nocreate: true,
            token: this.editToken
        }, customRequestOptions);
    }

    /**
     * Deletes a new wiki page
     *
     * @param {string}  title
     * @param {string}  [reason]
     * @param {object}  [customRequestOptions]
     *
     * @returns {Promise}
     */
    delete(title, reason, customRequestOptions) {
        return this.request({
            action: 'delete',
            title: title,
            reason: reason || this.options.defaultSummary,
            token: this.editToken
        }, customRequestOptions);
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

            let params = MWBot.merge({
                action: 'upload',
                filename: title || path.basename(pathToFile),
                file: file,
                comment: comment || '',
                token: this.editToken
            }, customParams);

            let uploadRequestOptions = MWBot.merge(this.globalRequestOptions, {

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

            let requestOptions = MWBot.merge(uploadRequestOptions, customRequestOptions);

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
        let params = MWBot.merge({
            ignorewarnings: ''
        }, customParams);
        return this.upload(title, pathToFile, comment, params, customRequestOptions);
    }


    //////////////////////////////////////////
    // BULK PROCESSING FUNCTIONS            //
    //////////////////////////////////////////

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
	 * Function for using API action=query with more than 50/500 items in multi-input fields.
	 *
	 * Several fields in the query API take multiple inputs but with a limit of 50 (or
	 * 500 for users with highapilimits).
	 * Example: the fields titles, pageids and revids in any query, ususers in list=users, etc.
	 *
	 * This function allows you to send a query as if this limit didn't exist. The array given to
	 * the multi-input field is split into batches of 50 (500 for bots) and individual queries
	 * are sent sequentially for each batch. A promise is returned finally resolved with the
	 * array of responses of each API call.
	 *
	 * @param {Object} query - the query object, the multi-input field should be an array
	 * @param {string} [batchFieldName=titles] - the name of the multi-input field
	 * @param {boolean} [hasApiHighLimit=false] - set true to use api high limits available
	 * with bot or sysop accounts
	 * @returns {Promise<Object[]>} - promise resolved when all the API queries have settled,
	 * with the array of responses.
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
	 * Execute an asynchronous function on a large number of pages (or other arbitrary items).
	 * Similar to Morebits.batchOperation in [[MediaWiki:Gadget-morebits.js]], but designed for
	 * working with promises.
	 *
	 * @param {Array} list - list of items to execute actions upon. The array would
	 * usually be of page names (strings).
	 * @param {Function} worker - function to execute upon each item in the list. Must
	 * return a promise.
	 * @param {number} [batchSize=50] - number of concurrent operations to take place.
	 * Set this to 1 for sequential operations. Default 50. Set this according to how
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
			console.log(statusText); // XXX
		}
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
					// XXX: Promise.allSettled isn't working with mwbot
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
			console.log(statusText); // XXX
		}

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


    //////////////////////////////////////////
    // SUPPLEMENTARY FUNCTIONS              //
    //////////////////////////////////////////

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

        let requestOptions = MWBot.merge({
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
     * Defaults to use the wikidata endpoint
     *
     * @param {string} query
     * @param {string} [apiUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {Promise}
     */
    sparqlQuery(query, endpointUrl, customRequestOptions) {

        endpointUrl = endpointUrl || this.options.apiUrl;

        let requestOptions = MWBot.merge({
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

    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
    //////////////////////////////////////////

    /**
     * Recursively merges two objects
     * Takes care that the two objects are not mutated
     *
     * @param {object} parent   Parent Object
     * @param {object} child    Child Object; overwrites parent properties
     *
     * @returns {object}        Merged Object
     */
    static merge(parent, child) {
        parent = parent || {};
        child = child || {};
        // Use {} as first parameter, as this object is mutated by default
        // We don't want that, so we're providing an empty object that is thrown away after the operation
        return Object.assign({}, parent, child);
    }

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

        if (operation === 'uploadOverwrite') {
            operation = 'upload!';
        }

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

module.exports = MWBot;
