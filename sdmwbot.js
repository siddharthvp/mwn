'use strict';

const fs            = require('fs');
const path          = require('path');
const Promise       = require('bluebird');
const request       = require('request');
const semlog        = require('semlog');
const log           = semlog.log;
const packageJson   = require('../package.json');

Promise.config({
    // Enable cancellation
    cancellation: true,
});

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
            apiUrl: false,
            sparqlEndpoint: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql' // Wikidata
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
                'User-Agent': 'mwbot/' + packageJson.version
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
     * Get mwbot version number
     * Uses ES5 getter
     */
    get version() {
        return packageJson.version;
    }

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
     * This can be uses instead of a login, if no actions are used that require one.
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
     * @returns {bluebird}
     */
    rawRequest(requestOptions) {

        this.counter.total += 1;

        return new Promise((resolve, reject) => {
            this.counter.resolved +=1;
            if (!requestOptions.uri) {
                this.counter.rejected +=1;
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
     *Executes a request with the ability to use custom parameters and custom request options
     *
     * @param {object} params               Request Parameters
     * @param {object} customRequestOptions Custom request options
     *
     * @returns {bluebird}
     */
    request(params, customRequestOptions) {

        return new Promise((resolve, reject) => {

            this.globalRequestOptions.uri = this.options.apiUrl;

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
     * @returns {bluebird}
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
     * @returns {bluebird}
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
     * Gets an edit token
     * Requires MW 1.27+
     *
     * @returns {bluebird}
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
     * Combines Login  with GetEditToken
     *
     * @param loginOptions
     *
     * @returns {bluebird}
     */
    loginGetEditToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getEditToken();
        });
    }


    /**
     * Combines Login  with GetCreateaccountToken
     *
     * @param loginOptions
     *
     * @returns {bluebird}
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
     * @returns {bluebird}
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
     * @param {string}  title    For multiple Pages use: PageA|PageB|PageC
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
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
     * @returns {bluebird}
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
     * @returns {bluebird}
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
     * @param {object}      [customRequestOptions]
     *
     * @returns {bluebird}
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
     * @returns {bluebird}
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
     * @returns {bluebird}
     */
    uploadOverwrite(title, pathToFile, comment, customParams, customRequestOptions) {
        let params = MWBot.merge({
            ignorewarnings: ''
        }, customParams);
        return this.upload(title, pathToFile, comment, params, customRequestOptions);
    }


    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    /**
     * Combines all standard CRUD operations into one concurrent batch operation
     * The batch request will also print log messages about the current job status
     * It includes some more detailed error handling
     *
     * If the concurrency is set to 1, it ensures a sequential order
     * by switching from Promise.map to Promise.mapSeries
     *
     * @param {object|array}   jobs
     * @param {string}  [summary]
     * @param {number}  [concurrency]
     * @param {object}  [customRequestOptions]
     */
    batch(jobs, summary, concurrency, customRequestOptions) {

        return new Promise((resolve, reject) => {

            summary = summary || this.options.defaultSummary;
            concurrency = concurrency || this.options.concurrency;

            let jobQueue = [];
            let results = {};
            let operation = 'map';

            // If no concurrency is needed, use bluebird Promise.mapSeries instead of .map
            // This ensures that tasks are executed in exactly the sequence as defined
            if (!concurrency || concurrency === 1) {
                operation = 'mapSeries';
            }

            // Jobs can be written in object or array notation
            // If it is written in the more convenient object notation, convert it to array notation
            if (Array.isArray(jobs)) {
                jobQueue = jobs;
            } else {
                for (let operation in jobs) {
                    let operationJobs = jobs[operation];
                    if (Array.isArray(operationJobs)) {
                        if (operation === 'upload' || operation === 'uploadOverwrite') {
                            for (let filePath of operationJobs) {
                                jobQueue.push([operation, path.basename(filePath), filePath, summary, false, customRequestOptions]);
                            }
                        } else {
                            for (let pageName of operationJobs) {
                                jobQueue.push([operation, pageName, summary, customRequestOptions]);
                            }
                        }
                    } else {
                        if (operation === 'upload' || operation === 'uploadOverwrite') {
                            for (let fileName in operationJobs) {
                                let filePath = operationJobs[fileName];
                                jobQueue.push([operation, fileName, filePath, summary, false, customRequestOptions]);
                            }
                        } else {
                            for (let pageName in operationJobs) {
                                let content = operationJobs[pageName];
                                jobQueue.push([operation, pageName, content, summary, customRequestOptions]);
                            }
                        }
                    }
                }
            }

            let currentCounter = 0;
            let totalCounter = jobQueue.length;

            // Dynamically invoke either .map or .mapSeries on bluebird Promise
            Promise[operation](jobQueue, (job) => {

                let operation = job[0];
                let pageName  = job[1];

                if (!this[operation]) {
                    return reject(new Error('Unsupported operation: ' + operation));
                }

                // Dynamically invoke the mwbot CRUD function with the parameters from the job array
                return this[operation](pageName, job[2], job[3], job[4]).then((response) => {

                    currentCounter += 1;

                    let status = '[=] ';
                    let reason = '';
                    let debugMessages = [];

                    if (operation === 'delete') {
                        status = '[-] ';
                    } else if (response.edit && response.edit.new === '') {
                        status = '[+] ';
                    } else if (response.edit && response.edit.newrevid) {
                        status = '[C] ';
                    } else if (response.query && response.query.pages && response.query.pages['-1']) {
                        status = '[?] ';
                        reason = 'missing';
                    } else if (response.query && response.query.pages) {
                        status = '[S] ';
                    } else if (response.upload && response.upload.result === 'Success') {
                        status = '[S] ';
                    } else if (response.upload && response.upload.result === 'Warning') {
                        status = '[/] ';
                        if (response.upload.warnings && response.upload.warnings.duplicate) {
                            reason = 'duplicate';
                            debugMessages.push('[D] [MWBOT] Duplicate: ' + response.upload.warnings.duplicate.join(', '));
                        }
                        if (response.upload.warnings && response.upload.warnings.exists) {
                            reason = 'exists';
                            debugMessages.push('[D] [MWBOT] Exists: ' + response.upload.warnings.exists);
                        }
                    }

                    MWBot.logStatus(status, currentCounter, totalCounter, operation, pageName, reason);

                    for (let msg of debugMessages) {
                        log(msg);
                    }

                    if (!results[operation]) {
                        results[operation] = {};
                    }
                    results[operation][pageName] = response;

                }).catch((err) => {
                    currentCounter += 1;

                    let status = '[E] ';
                    let reason = '';

                    if (err.response && err.response.error && err.response.error.code) {
                        let code = err.response.error.code;
                        if (code === 'articleexists') {
                            status = '[/] ';
                            reason = code;
                        } else if (code === 'missingtitle') {
                            status = '[?] ';
                            reason = code;
                        }
                    }

                    MWBot.logStatus(status, currentCounter, totalCounter, operation, pageName, reason);

                    if (status === '[E] ') {
                        log(err);
                        if (err.response) {
                            log(err.response);
                        }
                    } else if (this.options.verbose && err.response && err.response.error && err.response.error.info) {
                        log('[D] ' + err.response.error.info);
                    }

                    if (!results[operation]) {
                        results[operation] = {};
                    }
                    results[operation][pageName] = err;
                });

            }, {
                concurrency: concurrency
            }).then(() => {
                return resolve(results);
            }).catch((err) => {
                // If an error happens, return the results nonetheless, as it contains all the errors
                // embedded in its data structure
                log('[E] [MWBOT] At least one exception occured during the batch job:');
                log(err);
                return reject(results);
            });

        });
    }

    /**
     * Execute an ASK Query
     *
     * @param {string} query
     * @param {string} [apiUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {bluebird}
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
     * @param {string} [endpointUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {bluebird}
     */
    sparqlQuery(query, endpointUrl, customRequestOptions) {

        endpointUrl = endpointUrl || this.options.sparqlEndpoint;

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

/**
 * Provide bluebird.js Promise
 * @link http://bluebirdjs.com/docs/api/new-promise.html
 */
MWBot.Promise = Promise;

/**
 * Provide bluebird.js Promise.map for concurrent batch requests
 * @link http://bluebirdjs.com/docs/api/promise.map.html
 */
MWBot.map = Promise.map;

/**
 * Provide bluebird.js Promise.mapSeries for sequential batch requests
 * @link http://bluebirdjs.com/docs/api/promise.mapseries.html
 */
MWBot.mapSeries = Promise.mapSeries;

module.exports = MWBot;
