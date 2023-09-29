/**
 *
 *  mwn: a MediaWiki bot framework for Node.js
 *
 * 	Copyright (C) 2020 Siddharth VP
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
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

// Node internal modules
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as stream from 'stream';
import * as http from 'http';
import * as https from 'https';

// NPM modules
import axios, { AxiosResponse } from 'axios';
import * as tough from 'tough-cookie';
import * as OAuth from 'oauth-1.0a';

// Nested classes of mwn
import MwnDateFactory, { MwnDate } from './date';
import MwnTitleFactory, { MwnTitle, SiteInfoQueryResponse } from './title';
import MwnPageFactory, { MwnPage } from './page';
import MwnWikitextFactory, { MwnWikitext } from './wikitext';
import MwnUserFactory, { MwnUser } from './user';
import MwnCategoryFactory, { MwnCategory } from './category';
import MwnFileFactory, { MwnFile } from './file';
import { RawRequestParams, Request, Response } from './core';
import { log, updateLoggingConfig } from './log';
import { MwnError, rejectWithError, rejectWithErrorCode } from './error';
import { link, Table, template, util } from './static_utils';
import { arrayChunk, ispromise, makeTitle, makeTitles, merge, mergeDeep1, sleep } from './utils';

import type {
	ApiDeleteParams,
	ApiEditPageParams,
	ApiMoveParams,
	ApiParseParams,
	ApiPurgeParams,
	ApiQueryAllMessagesParams,
	ApiQueryAllPagesParams,
	ApiQueryCategoryMembersParams,
	ApiQuerySearchParams,
	ApiQueryUserInfoParams,
	ApiRollbackParams,
	ApiUndeleteParams,
	ApiUploadParams,
} from './api_params';
import {
	ApiDeleteResponse,
	ApiEditResponse,
	ApiMoveResponse,
	ApiPage,
	ApiResponse,
	ApiRevision,
	ApiRollbackResponse,
	ApiSearchResult,
	ApiResponseSubType,
	ApiUndeleteResponse,
	ApiUploadResponse,
} from './api_response_types';

export { MwnDate, MwnTitle, MwnPage, MwnFile, MwnCategory, MwnWikitext, MwnUser, ApiPage, ApiRevision };
// Export, if only for the sake of getting generated documentation
export * from './api_response_types';
export type { PageViewData, PageViewOptions } from './page';
export type { TemplateConfig, Template, MwnWikitextStatic } from './wikitext';

export interface MwnOptions {
	silent?: boolean;
	apiUrl?: string;
	userAgent?: string;
	username?: string;
	password?: string;
	OAuthCredentials?: {
		consumerToken: string;
		consumerSecret: string;
		accessToken: string;
		accessSecret: string;
	};
	OAuth2AccessToken?: string;
	maxRetries?: number;
	retryPause?: number;
	shutoff?: {
		intervalDuration?: number;
		page?: string;
		condition?: RegExp | ((text: string) => boolean);
		onShutoff?: (text: string) => void;
	};
	defaultParams?: ApiParams;
	suppressAPIWarnings?: boolean;
	editConfig?: editConfigType;
	suppressInvalidDateWarning?: boolean;
}

type editConfigType = {
	conflictRetries?: number;
	suppressNochangeWarning?: boolean;
	exclusionRegex?: RegExp;
};

export type ApiParams = {
	[param: string]:
		| string
		| string[]
		| boolean
		| number
		| number[]
		| Date
		| File
		| {
				stream: NodeJS.ReadableStream;
				name: string;
		  };
};

export class Mwn {
	/**
	 * Bot instance Login State
	 * Is received from the MW Login API and contains token, userid, etc.
	 */
	state: any = {};

	/**
	 * Bot instance is logged in or not
	 */
	loggedIn = false;

	/**
	 * Bot instance's edit token. Initially set as an invalid token string
	 * so that the badtoken handling logic is invoked if the token is
	 * not set before a query is sent.
	 * @type {string}
	 */
	csrfToken = '%notoken%';

	/**
	 * Default options.
	 * Should be immutable
	 */
	readonly defaultOptions: MwnOptions = {
		// suppress messages, except for error messages and warnings
		silent: false,

		// site API url, example "https://en.wikipedia.org/w/api.php"
		apiUrl: null,

		// User agent string
		userAgent: 'mwn',

		// bot login username and password, setup using Special:BotPasswords
		username: null,
		password: null,

		// OAuth credentials
		OAuthCredentials: {
			consumerToken: null,
			consumerSecret: null,
			accessToken: null,
			accessSecret: null,
		},

		// max number of times to retry the same request on errors due to
		// maxlag, wiki being in readonly mode, and other transient errors
		maxRetries: 3,

		// milliseconds to pause before retrying after a transient error
		retryPause: 5000,

		// Bot emergency shutoff options
		shutoff: {
			intervalDuration: 10000,
			page: null,
			condition: /^\s*$/,
			onShutoff() {},
		},

		// default parameters included in every API request
		defaultParams: {
			format: 'json',
			formatversion: '2',
			maxlag: 5,
		},

		// suppress logging of warnings received from the API
		suppressAPIWarnings: false,

		// options for the edit() function
		editConfig: {
			// max number of retries on edit conflicts
			conflictRetries: 2,
			// suppress warning on an edit resulting in no change to the page
			suppressNochangeWarning: false,
			// abort edit if exclusionRegex matches on the page content
			exclusionRegex: null,
		},
	};

	/**
	 * Actual, current options of the bot instance
	 * Mix of the default options, the custom options and later changes
	 * @type {Object}
	 */
	options: MwnOptions;

	/**
	 * Cookie jar for the bot instance - holds session and login cookies
	 * @type {tough.CookieJar}
	 */
	cookieJar: tough.CookieJar = new tough.CookieJar();

	static requestDefaults: RawRequestParams = {
		headers: {
			'Accept-Encoding': 'gzip',
		},

		// keep-alive pools and reuses TCP connections, for better performance
		httpAgent: new http.Agent({ keepAlive: true }),
		httpsAgent: new https.Agent({ keepAlive: true }),

		timeout: 60000, // 60 seconds
	};

	/**
	 * Request options for the axios library.
	 * Change the defaults using setRequestOptions()
	 * @type {Object}
	 */
	requestOptions: RawRequestParams = mergeDeep1(
		{
			responseType: 'json',
		},
		Mwn.requestDefaults
	);

	/**
	 * Emergency shutoff config
	 * @type {{hook: NodeJS.Timeout, state: boolean}}
	 */
	shutoff: { state: boolean; hook: NodeJS.Timeout } = {
		state: false,
		hook: null,
	};

	hasApiHighLimit = false;

	oauth: OAuth;

	usingOAuth: boolean;
	usingOAuth2: boolean;

	static Error = MwnError;

	// Expose logger
	static log = log;
	static setLoggingConfig = updateLoggingConfig;

	static link = link;
	static template = template;
	static Table = Table;

	/** @deprecated Use {@link Table} instead **/
	static table = Table;

	static util = util;

	/** @deprecated Use {@link Title} instead */
	title = MwnTitleFactory();
	/**
	 * Title class associated with the bot instance.
	 * See {@link MwnTitle} interface for methods on title objects.
	 */
	Title = MwnTitleFactory();

	/** @deprecated Use {@link Page} instead */
	page = MwnPageFactory(this);
	/**
	 * Page class associated with the bot instance.
	 * See {@link MwnPage} interface for methods on page objects.
	 */
	Page = MwnPageFactory(this);

	/** @deprecated Use {@link Category} instead */
	category = MwnCategoryFactory(this);
	/**
	 * Category class associated with the bot instance.
	 * See {@link MwnCategory} interface for methods on category objects.
	 */
	Category = MwnCategoryFactory(this);

	/** @deprecated Use {@link File} instead */
	file = MwnFileFactory(this);
	/**
	 * File class associated with the bot instance.
	 * See {@link MwnFile} interface for methods on file objects.
	 */
	File = MwnFileFactory(this);

	/** @deprecated Use {@link User} instead */
	user = MwnUserFactory(this);
	/**
	 * User class associated with the bot instance.
	 * See {@link MwnUser} interface for methods on user objects.
	 */
	User = MwnUserFactory(this);

	/** @deprecated Use {@link Wikitext} instead */
	wikitext = MwnWikitextFactory(this);
	/**
	 * Wikitext class associated with the bot instance.
	 * See {@link MwnWikitext} interface for methods on wikitext objects.
	 */
	Wikitext = MwnWikitextFactory(this);

	/** @deprecated Use {@link Date} instead */
	date = MwnDateFactory(this);
	/**
	 * Date class associated with the bot instance.
	 * See {@link MwnDate} interface for methods on date objects.
	 */
	Date = MwnDateFactory(this);

	/**
	 * Constructs a new bot instance
	 * It is advised to create one bot instance for every API to use
	 * A bot instance has its own state (e.g. tokens) that is necessary for some operations
	 *
	 * @param [customOptions] - Custom options
	 */
	constructor(customOptions?: MwnOptions | string) {
		if (process.versions.node) {
			let majorVersion = parseInt(process.versions.node);
			if (majorVersion < 10) {
				log(
					`[W] Detected node version v${process.versions.node}, but mwn is supported only on node v10.x and above`
				);
			}
		}

		if (typeof customOptions === 'string') {
			// Read options from file (JSON):
			try {
				customOptions = JSON.parse(fs.readFileSync(customOptions).toString());
			} catch (err) {
				throw new Error(`Failed to read or parse JSON config file: ` + err);
			}
		}
		this.options = mergeDeep1(this.defaultOptions, customOptions);
	}

	/**
	 * Initialize a bot object. Login to the wiki and fetch editing tokens. If OAuth
	 * credentials are provided, they will be used over BotPassword credentials.
	 * Also fetches the site data needed for parsing and constructing title objects.
	 * @param {Object} config - Bot configurations, including apiUrl, and either the
	 * username and password or the OAuth credentials
	 * @returns {Promise<Mwn>} bot object
	 */
	static async init(config: MwnOptions): Promise<Mwn> {
		const bot = new Mwn(config);
		if (bot.options.OAuth2AccessToken || bot._usingOAuth()) {
			bot.initOAuth();
			await bot.getTokensAndSiteInfo();
		} else {
			await bot.login();
		}
		return bot;
	}

	/**
	 * Set and overwrite mwn options
	 * @param {Object} customOptions
	 */
	setOptions(customOptions: MwnOptions) {
		this.options = mergeDeep1(this.options, customOptions);
	}

	/**
	 * Sets the API URL for MediaWiki requests
	 * This can be uses instead of a login, if no actions are used that require login.
	 * @param {string} apiUrl - API url to MediaWiki, e.g. https://en.wikipedia.org/w/api.php
	 */
	setApiUrl(apiUrl: string) {
		this.options.apiUrl = apiUrl;
	}

	/**
	 * Sets and overwrites the raw request options, used by the axios library
	 * See https://www.npmjs.com/package/axios
	 */
	setRequestOptions(customRequestOptions: RawRequestParams) {
		return mergeDeep1(this.requestOptions, customRequestOptions);
	}

	/**
	 * Set the default parameters to be sent in API calls.
	 * @param {Object} params - default parameters
	 */
	setDefaultParams(params: ApiParams) {
		this.options.defaultParams = merge(this.options.defaultParams, params);
	}

	/**
	 * Set your API user agent. See https://meta.wikimedia.org/wiki/User-Agent_policy
	 * Required for WMF wikis.
	 * @param {string} userAgent
	 */
	setUserAgent(userAgent: string) {
		this.options.userAgent = userAgent;
	}

	/**
	 * @private
	 * Determine if we're going to use OAuth for authentication
	 */
	private _usingOAuth(): boolean {
		const creds = this.options.OAuthCredentials;
		if (typeof creds !== 'object') {
			return false;
		}
		if (!creds.consumerToken || !creds.consumerSecret || !creds.accessToken || !creds.accessSecret) {
			return false;
		}
		return true;
	}

	/**
	 * Initialize OAuth instance
	 */
	initOAuth() {
		if (this.options.OAuth2AccessToken) {
			this.usingOAuth2 = true;
			return;
		}

		if (!this._usingOAuth()) {
			// without this, the API would return a confusing
			// mwoauth-invalid-authorization invalid consumer error
			throw new Error('[mwn] Invalid OAuth config');
		}
		try {
			this.oauth = new OAuth({
				consumer: {
					key: this.options.OAuthCredentials.consumerToken,
					secret: this.options.OAuthCredentials.consumerSecret,
				},
				signature_method: 'HMAC-SHA1',
				// based on example at https://www.npmjs.com/package/oauth-1.0a
				hash_function(base_string, key) {
					return crypto.createHmac('sha1', key).update(base_string).digest('base64');
				},
			});
			this.usingOAuth = true;
		} catch (err) {
			throw new Error('Failed to construct OAuth object. ' + err);
		}
	}

	/************ CORE REQUESTS ***************/

	/**
	 * Executes a raw request
	 * Uses the axios library
	 * @param {Object} requestOptions
	 * @returns {Promise}
	 */
	async rawRequest(requestOptions: RawRequestParams): Promise<AxiosResponse> {
		if (!requestOptions.url) {
			return rejectWithError({
				code: 'mwn_nourl',
				info: 'No URL provided for API request!',
				disableRetry: true,
				request: requestOptions,
			});
		}
		return axios(
			mergeDeep1(
				{},
				Mwn.requestDefaults,
				{
					method: 'get',
					headers: {
						'User-Agent': this.options.userAgent,
					},
				},
				requestOptions
			)
		);
	}

	/**
	 * Executes a request with the ability to use custom parameters and custom
	 * request options
	 * @param {Object} params
	 * @param {Object} [customRequestOptions={}]
	 * @returns {Promise}
	 */
	async request(params: ApiParams, customRequestOptions: RawRequestParams = {}): Promise<ApiResponse> {
		if (this.shutoff.state) {
			return rejectWithError({
				code: 'bot-shutoff',
				info: `Bot was shut off (check ${this.options.shutoff.page})`,
			});
		}

		const req = new Request(this, params, customRequestOptions);
		await req.process();

		return this.rawRequest(req.requestParams).then(
			(fullResponse: AxiosResponse<ApiResponse>) =>
				new Response(this, req.apiParams, req.requestParams).process(fullResponse),
			(error) => new Response(this, req.apiParams, req.requestParams).handleRequestFailure(error)
		);
	}

	async query(params: ApiParams, customRequestOptions: RawRequestParams = {}): Promise<ApiResponse> {
		return this.request(Object.assign({ action: 'query' }, params), customRequestOptions);
	}

	/************** CORE FUNCTIONS *******************/

	/**
	 * Executes a Login
	 * @see https://www.mediawiki.org/wiki/API:Login
	 * @returns {Promise}
	 */
	async login(loginOptions?: { username?: string; password?: string; apiUrl?: string }): Promise<ApiResponse> {
		this.options = merge(this.options, loginOptions);
		if (!this.options.username || !this.options.password || !this.options.apiUrl) {
			return rejectWithError({
				code: 'mwn_nologincredentials',
				info: 'Incomplete login credentials!',
			});
		}

		let loginString = this.options.username + '@' + this.options.apiUrl.split('/api.php').join('');

		// Step 1: Fetch login token
		const loginTokenResponse = await this.request({
			action: 'query',
			meta: 'tokens',
			type: 'login',
			// unset the assert parameter (in case it's given by the user as a default
			// option), as it will invariably fail until login is performed.
			assert: undefined,
		});
		if (!loginTokenResponse?.query?.tokens?.logintoken) {
			log('[E] [mwn] Login failed with invalid response: ' + loginString);
			return rejectWithError({
				code: 'mwn_notoken',
				info: 'Failed to get login token',
				response: loginTokenResponse,
			});
		}
		Object.assign(this.state, loginTokenResponse.query.tokens);

		// Step 2: Post login request
		const loginResponse = await this.request({
			action: 'login',
			lgname: this.options.username,
			lgpassword: this.options.password,
			lgtoken: loginTokenResponse.query.tokens.logintoken,
			assert: undefined, // as above, assert won't work till the user is logged in
		});

		let reason;
		let data = loginResponse.login;
		if (data) {
			if (data.result === 'Success') {
				Object.assign(this.state, data);
				this.loggedIn = true;
				if (!this.options.silent) {
					log('[S] [mwn] Login successful: ' + loginString);
				}

				// Step 3: fetch tokens for editing, and info about namespaces for MwnTitle
				await this.getTokensAndSiteInfo().catch((err) => {
					log(`[W] Failed fetching tokens and siteinfo: ${err}`);
				});

				return data;
			} else if (data.result === 'Aborted') {
				if (
					data.reason === 'Cannot log in when using MediaWiki\\Session\\BotPasswordSessionProvider sessions.'
				) {
					reason = `Already logged in as ${this.options.username}, logout first to re-login`;
				} else if (
					data.reason === 'Cannot log in when using MediaWiki\\Extension\\OAuth\\SessionProvider sessions.'
				) {
					reason = `Cannot use login/logout while using OAuth`;
				} else if (data.reason) {
					reason = data.result + ': ' + data.reason;
				}
			} else if (data.result && data.reason) {
				reason = data.result + ': ' + data.reason;
			}
		}

		return rejectWithError({
			code: 'mwn_failedlogin',
			info: reason || 'Login failed',
			response: loginResponse,
		});
	}

	/**
	 * Log out of the account. Flushes the cookie jar and clears the saved tokens.
	 * Should not be used if authenticating via OAuth.
	 * @returns {Promise<void>}
	 */
	async logout(): Promise<void> {
		if (this.usingOAuth) {
			throw new Error("Can't use logout() while using OAuth");
		}
		return this.request({
			action: 'logout',
			token: this.csrfToken,
		}).then(() => {
			// returns an empty response ({}) if successful
			this.loggedIn = false;
			this.state = {};
			this.csrfToken = '%notoken%';
			return this.cookieJar.removeAllCookies();
		});
	}

	/**
	 * Create an account. Only works on wikis without extensions like
	 * ConfirmEdit enabled (hence doesn't work on WMF wikis).
	 * @param username
	 * @param password
	 */
	async createAccount(username: string, password: string): Promise<any> {
		if (!this.state.createaccounttoken) {
			// not logged in
			await this.getTokens();
		}
		return this.request({
			action: 'createaccount',
			createreturnurl: 'https://example.com',
			createtoken: this.state.createaccounttoken,
			username: username,
			password: password,
			retype: password,
		}).then((json) => {
			let data = json.createaccount;
			if (data.status === 'FAIL') {
				return rejectWithError({
					code: data.messagecode,
					info: data.message,
					...data,
				});
			} else {
				// status === 'PASS' or other value
				return data;
			}
		});
	}

	/**
	 * Get basic info about the logged-in user
	 * @param [options]
	 * @returns {Promise}
	 */
	async userinfo(options: ApiQueryUserInfoParams = {}): Promise<any> {
		return this.request({
			action: 'query',
			meta: 'userinfo',
			...options,
		}).then((response) => response.query.userinfo);
	}

	/**
	 * Gets namespace-related information for use in title nested class.
	 * This need not be used if login() is being used. This is for cases
	 * where mwn needs to be used without logging in.
	 * @returns {Promise<void>}
	 */
	async getSiteInfo(): Promise<void> {
		return this.request({
			action: 'query',
			meta: 'siteinfo',
			siprop: 'general|namespaces|namespacealiases',
		}).then((result: SiteInfoQueryResponse) => {
			this.title.processNamespaceData(result);
			this.Title.processNamespaceData(result);
		});
	}

	/**
	 * Get tokens and saves them in this.state
	 * @returns {Promise<void>}
	 */
	async getTokens(): Promise<void> {
		return this.request({
			action: 'query',
			meta: 'tokens',
			type: 'csrf|createaccount|login|patrol|rollback|userrights|watch',
		}).then((response: ApiResponse) => {
			if (response.query && response.query.tokens) {
				this.csrfToken = response.query.tokens.csrftoken;
				this.state = merge(this.state, response.query.tokens);
			} else {
				return rejectWithError({
					code: 'mwn_notoken',
					info: 'Could not get token',
					response,
				});
			}
		});
	}

	/**
	 * Gets an edit token (also used for most other actions
	 * such as moving and deleting)
	 * This is only compatible with MW >= 1.24
	 * @returns {Promise<string>}
	 */
	async getCsrfToken(): Promise<string> {
		return this.getTokens().then(() => this.csrfToken);
	}

	/**
	 * Get tokens and siteinfo (using a single API request) and save them in the bot state.
	 * @returns {Promise<void>}
	 */
	async getTokensAndSiteInfo(): Promise<void> {
		return this.request({
			action: 'query',
			meta: 'tokens|siteinfo|userinfo',
			type: 'csrf|createaccount|login|patrol|rollback|userrights|watch',
			siprop: 'general|namespaces|namespacealiases',
			uiprop: 'rights',
		}).then((response: ApiResponse & SiteInfoQueryResponse) => {
			this.title.processNamespaceData(response);
			this.Title.processNamespaceData(response);
			if (response.query.userinfo.rights.includes('apihighlimits')) {
				this.hasApiHighLimit = true;
			}
			if (response.query && response.query.tokens) {
				this.csrfToken = response.query.tokens.csrftoken;
				this.state = merge(this.state, response.query.tokens);
			} else {
				return rejectWithError({
					code: 'mwn_notoken',
					info: 'Could not get token',
					response,
				});
			}
		});
	}

	/**
	 * Get type of token to be used with an API action
	 * @param {string} action - API action parameter
	 * @returns {Promise<string>}
	 */
	async getTokenType(action: string): Promise<string> {
		return this.request({
			action: 'paraminfo',
			modules: action,
		}).then((response) => {
			return response.paraminfo.modules[0].parameters.find((p: ApiResponseSubType) => p.name === 'token')
				.tokentype;
		});
	}

	/**
	 * Login and fetch edit tokens. Deprecated in favour of login(), which
	 * also fetches tokens from mwn v0.10
	 * @deprecated
	 * @param [loginOptions]
	 * @returns {Promise<void>}
	 */
	async loginGetToken(loginOptions?: MwnOptions): Promise<void> {
		return this.login(loginOptions).then();
	}

	/**
	 * Get the wiki's server time
	 * @returns {Promise<string>}
	 */
	async getServerTime(): Promise<string> {
		return this.request({
			action: 'query',
			curtimestamp: true,
		}).then((data) => {
			return data.curtimestamp;
		});
	}

	/**
	 * Fetch and parse a JSON wikipage
	 * @param {string} title - page title
	 * @returns {Promise<Object>} parsed JSON object
	 */
	async parseJsonPage(title: string): Promise<any> {
		return this.read(title).then((data) => {
			try {
				return JSON.parse(data.revisions[0].content);
			} catch (e) {
				return rejectWithErrorCode('invalidjson');
			}
		});
	}

	/**
	 * Fetch MediaWiki messages
	 * @param messages
	 * @param options
	 */
	async getMessages(messages: string | string[], options: ApiQueryAllMessagesParams = {}) {
		return this.request({
			action: 'query',
			meta: 'allmessages',
			ammessages: messages,
			...options,
		}).then((data) => {
			let result: Record<string, string> = {};
			data.query.allmessages.forEach((obj: ApiResponseSubType) => {
				if (!obj.missing) {
					result[obj.name] = obj.content;
				}
			});
			return result;
		});
	}

	/**
	 * Enable bot emergency shutoff
	 */
	enableEmergencyShutoff(shutoffOptions?: {
		page?: string;
		intervalDuration?: number;
		condition?: RegExp | ((text: string) => boolean);
		onShutoff?: (text: string) => void;
	}): void {
		Object.assign(this.options.shutoff, shutoffOptions);

		this.shutoff.hook = setInterval(async () => {
			let text = await new this.Page(this.options.shutoff.page).text();
			let cond = this.options.shutoff.condition;
			if ((cond instanceof RegExp && !cond.test(text)) || (cond instanceof Function && !cond(text))) {
				this.shutoff.state = true;
				this.disableEmergencyShutoff();
				// user callback executed last, so that an error thrown by
				// it doesn't prevent the the above from being run
				this.options.shutoff.onShutoff(text);
			}
		}, this.options.shutoff.intervalDuration);
	}

	/**
	 * Disable emergency shutoff detection.
	 * Use this only if it was ever enabled.
	 */
	disableEmergencyShutoff(): void {
		clearInterval(this.shutoff.hook);
	}

	/***************** HELPER FUNCTIONS ******************/

	/**
	 * Reads the content and and meta-data of one (or many) pages.
	 * Content from the "main" slot is copied over to every revision object
	 * for easier referencing (`pg.revisions[0].content` can be used instead of
	 * `pg.revisions[0].slots.main.content`).
	 *
	 * @param {string|string[]|number|number[]} titles - for multiple pages use an array
	 * @param {Object} [options]
	 * @returns {Promise<ApiPage>}
	 */
	read(titles: string | number | MwnTitle, options?: ApiParams): Promise<ApiPage>;
	read(titles: string[] | number[] | MwnTitle[], options?: ApiParams): Promise<ApiPage[]>;
	read(titles: any, options?: any): any {
		let pages = Array.isArray(titles) ? titles : [titles];
		let batchFieldName = typeof pages[0] === 'number' ? 'pageids' : 'titles';
		return this.massQuery(
			{
				action: 'query',
				...makeTitles(titles),
				prop: 'revisions',
				rvprop: 'content|timestamp',
				rvslots: 'main',
				redirects: true,
				...options,
			},
			batchFieldName
		).then((jsons: Array<ApiResponse>) => {
			let data = jsons.reduce((data, json) => {
				json.query.pages.forEach((pg: ApiPage) => {
					if (pg.revisions) {
						pg.revisions.forEach((rev: ApiRevision) => {
							Object.assign(rev, rev.slots.main);
						});
					}
				});
				return data.concat(json.query.pages);
			}, []);
			return data.length === 1 ? data[0] : data;
		});
	}

	async *readGen(titles: string[], options?: ApiParams, batchSize?: number): AsyncGenerator<ApiPage> {
		let massQueryResponses = this.massQueryGen(
			{
				action: 'query',
				...makeTitles(titles),
				prop: 'revisions',
				rvprop: 'content|timestamp',
				rvslots: 'main',
				redirects: true,
				...options,
			},
			typeof titles[0] === 'number' ? 'pageids' : 'titles',
			batchSize
		);

		for await (let response of massQueryResponses) {
			if (response && response.query && response.query.pages) {
				for (let pg of response.query.pages) {
					if (pg.revisions) {
						pg.revisions.forEach((rev: ApiRevision) => {
							Object.assign(rev, rev.slots.main);
						});
					}
					yield pg;
				}
			}
		}
	}

	// adapted from mw.Api().edit
	/**
	 * @param {string|number|MwnTitle} title - Page title or page ID or MwnTitle object
	 * @param {Function} transform - Callback that prepares the edit. It takes one
	 * argument that is an { content: 'string: page content', timestamp: 'string:
	 * time of last edit' } object. This function should return an object with
	 * edit API parameters or just the updated text, or a promise providing one of
	 * those.
	 * @param {Object} [editConfig] - Overridden edit options. Available options:
	 * conflictRetries, suppressNochangeWarning, exclusionRegex
	 * @config conflictRetries - maximum number of times to retry edit after encountering edit
	 * conflicts.
	 * @config suppressNochangeWarning - don't show the warning when no change is actually
	 * made to the page on an successful edit
	 * @config exclusionRegex - don't edit if the page text matches this regex. Used for bot
	 * per-page exclusion compliance.
	 * @return {Promise<Object>} Edit API response
	 */
	async edit(
		title: string | number,
		transform: (rev: { content: string; timestamp: string }) => string | ApiEditPageParams,
		editConfig?: editConfigType
	): Promise<ApiEditResponse> {
		editConfig = editConfig || this.options.editConfig;

		let basetimestamp: string, curtimestamp: string;

		return this.request({
			action: 'query',
			...makeTitles(title),
			prop: 'revisions',
			rvprop: ['content', 'timestamp'],
			rvslots: 'main',
			formatversion: '2',
			curtimestamp: true,
		})
			.then((data: ApiResponse) => {
				let page, revision, revisionContent;
				if (!data.query || !data.query.pages) {
					return rejectWithErrorCode('unknown');
				}
				page = data.query.pages[0];
				if (!page || page.invalid) {
					return rejectWithErrorCode('invalidtitle');
				}
				if (page.missing) {
					return Promise.reject(new Mwn.Error.MissingPage());
				}
				revision = page.revisions[0];
				try {
					revisionContent = revision.slots.main.content;
				} catch (err) {
					return rejectWithErrorCode('unknown');
				}
				basetimestamp = revision.timestamp;
				curtimestamp = data.curtimestamp;

				if (editConfig.exclusionRegex && editConfig.exclusionRegex.test(revisionContent)) {
					return rejectWithErrorCode('bot-denied');
				}

				return transform({
					timestamp: revision.timestamp,
					content: revisionContent,
				});
			})
			.then((returnVal) => {
				if (typeof returnVal !== 'string' && !returnVal) {
					return { edit: { result: 'aborted' } };
				}
				const editParams =
					typeof returnVal === 'object'
						? returnVal
						: {
								text: String(returnVal),
						  };
				return this.request({
					action: 'edit',
					...makeTitle(title),
					formatversion: '2',
					basetimestamp: basetimestamp,
					starttimestamp: curtimestamp,
					nocreate: true,
					bot: true,
					token: this.csrfToken,
					...editParams,
				});
			})
			.then(
				(data) => {
					if (data.edit && data.edit.nochange && !editConfig.suppressNochangeWarning) {
						log(`[W] No change from edit to ${data.edit.title}`);
					}
					return data.edit;
				},
				(err) => {
					if (err.code === 'editconflict' && editConfig.conflictRetries > 0) {
						editConfig.conflictRetries--;
						return this.edit(title, transform, editConfig);
					} else {
						return rejectWithError(err);
					}
				}
			);
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
	async save(
		title: string | number,
		content: string,
		summary?: string,
		options?: ApiEditPageParams
	): Promise<ApiEditResponse> {
		return this.request({
			action: 'edit',
			...makeTitle(title),
			text: content,
			summary: summary,
			bot: true,
			token: this.csrfToken,
			...options,
		}).then((data) => data.edit);
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
	async create(
		title: string,
		content: string,
		summary?: string,
		options?: ApiEditPageParams
	): Promise<ApiEditResponse> {
		return this.request({
			action: 'edit',
			title: String(title),
			text: content,
			summary: summary,
			createonly: true,
			bot: true,
			token: this.csrfToken,
			...options,
		}).then((data) => data.edit);
	}

	/**
	 * Post a new section to the page.
	 *
	 * @param {string|number} title - title or pageid (as number)
	 * @param {string} header
	 * @param {string} message wikitext message
	 * @param {Object} [additionalParams] Additional API parameters, e.g. `{ redirect: true }`
	 */
	async newSection(
		title: string | number,
		header: string,
		message: string,
		additionalParams?: ApiEditPageParams
	): Promise<ApiEditResponse> {
		return this.request({
			action: 'edit',
			...makeTitle(title),
			section: 'new',
			summary: header,
			text: message,
			bot: true,
			token: this.csrfToken,
			...additionalParams,
		}).then((data) => data.edit);
	}

	/**
	 * Deletes a page
	 *
	 * @param {string|number}  title - title or pageid (as number)
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 * @returns {Promise}
	 */
	async delete(title: string | number, summary: string, options?: ApiDeleteParams): Promise<ApiDeleteResponse> {
		return this.request({
			action: 'delete',
			...makeTitle(title),
			reason: summary,
			token: this.csrfToken,
			...options,
		}).then((data) => data.delete);
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
	async undelete(title: string, summary: string, options?: ApiUndeleteParams): Promise<ApiUndeleteResponse> {
		return this.request({
			action: 'undelete',
			title: String(title),
			reason: summary,
			token: this.csrfToken,
			...options,
		}).then((data) => data.undelete);
	}

	/**
	 * Moves a new page
	 *
	 * @param {string}  fromtitle
	 * @param {string}  totitle
	 * @param {string}  [summary]
	 * @param {object}  [options]
	 */
	async move(fromtitle: string, totitle: string, summary: string, options?: ApiMoveParams): Promise<ApiMoveResponse> {
		return this.request({
			action: 'move',
			from: fromtitle,
			to: totitle,
			reason: summary,
			movetalk: true,
			token: this.csrfToken,
			...options,
		}).then((data) => data.move);
	}

	/**
	 * Parse wikitext. Convenience method for 'action=parse'.
	 *
	 * @param {string} content Content to parse.
	 * @param {Object} additionalParams Parameters object to set custom settings, e.g.
	 *   redirects, sectionpreview.  prop should not be overridden.
	 * @return {Promise<string>}
	 */
	async parseWikitext(content: string, additionalParams?: ApiParseParams): Promise<string> {
		return this.request({
			action: 'parse',
			text: String(content),
			contentmodel: 'wikitext',
			disablelimitreport: true,
			disableeditsection: true,
			formatversion: 2,
			...additionalParams,
		}).then(function (data) {
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
	async parseTitle(title: string, additionalParams?: ApiParseParams): Promise<string> {
		return this.request({
			page: String(title),
			formatversion: 2,
			action: 'parse',
			contentmodel: 'wikitext',
			...additionalParams,
		}).then(function (data) {
			return data.parse.text;
		});
	}

	/**
	 * Upload an image from a the local disk to the wiki.
	 * If a file with the same name exists, it will be over-written.
	 * @param {string} filepath
	 * @param {string} title
	 * @param {string} text
	 * @param {object} options
	 * @returns {Promise<Object>}
	 */
	async upload(filepath: string, title: string, text: string, options?: ApiUploadParams): Promise<ApiUploadResponse> {
		return this.request(
			{
				action: 'upload',
				file: {
					stream: fs.createReadStream(filepath),
					name: path.basename(filepath),
				},
				filename: title,
				text: text,
				ignorewarnings: true,
				token: this.csrfToken,
				...options,
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		).then((data) => {
			if (data.upload.warnings) {
				log(`[W] The API returned warnings while uploading to ${title}:`);
				log(data.upload.warnings);
			}
			return data.upload;
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
	 * @returns {Promise<Object>}
	 */
	async uploadFromUrl(
		url: string,
		title: string,
		text: string,
		options?: ApiUploadParams
	): Promise<ApiUploadResponse> {
		return this.request({
			action: 'upload',
			url: url,
			filename: title || path.basename(url),
			text: text,
			ignorewarnings: true,
			token: this.csrfToken,
			...options,
		}).then((data) => {
			if (data.upload.warnings) {
				log('[W] The API returned warnings while uploading to ' + title + ':');
				log(data.upload.warnings);
			}
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
	async download(file: string | number, localname: string): Promise<void> {
		return this.request({
			action: 'query',
			...makeTitles(file),
			prop: 'imageinfo',
			iiprop: 'url',
		}).then((data) => {
			const url = data.query.pages[0].imageinfo[0].url;
			const name = new this.Title(data.query.pages[0].title).getMainText();
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
	async downloadFromUrl(url: string, localname: string): Promise<void> {
		return this.rawRequest({
			method: 'get',
			url: url,
			responseType: 'stream',
		}).then((response) => {
			const writeStream = (response.data as stream).pipe(fs.createWriteStream(localname || path.basename(url)));
			return new Promise((resolve, reject) => {
				writeStream.on('finish', () => {
					resolve();
				});
				writeStream.on('error', (err) => {
					reject(err);
				});
			});
		});
	}

	async saveOption(option: string, value: string) {
		return this.saveOptions({ [option]: value });
	}

	async saveOptions(options: Record<string, string>) {
		return this.request({
			action: 'options',
			change: Object.entries(options).map(([key, val]) => key + '=' + val),
			token: this.csrfToken,
		});
	}

	/**
	 * Convenience method for `action=rollback`.
	 *
	 * @param {string|number} page - page title or page id as number or MwnTitle object
	 * @param {string} user
	 * @param {Object} [params] Additional parameters
	 * @return {Promise}
	 */
	async rollback(page: string | number, user: string, params?: ApiRollbackParams): Promise<ApiRollbackResponse> {
		return this.request({
			action: 'rollback',
			...makeTitle(page),
			user: user,
			token: this.state.rollbacktoken,
			...params,
		}).then((data) => {
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
	async purge(titles: string[] | string | number[] | number, options?: ApiPurgeParams): Promise<ApiResponse> {
		return this.request({
			action: 'purge',
			...makeTitles(titles),
			...options,
		}).then((data) => data.purge);
	}

	/**
	 * Get pages with names beginning with a given prefix
	 * @param {string} prefix
	 * @param {Object} otherParams
	 *
	 * @returns {Promise<string[]>} - array of page titles (upto 5000 or 500)
	 */
	async getPagesByPrefix(prefix: string, otherParams?: ApiQueryAllPagesParams): Promise<string[]> {
		const title = this.Title.newFromText(prefix);
		if (!title) {
			throw new Error('invalid prefix for getPagesByPrefix');
		}
		return this.request({
			action: 'query',
			list: 'allpages',
			apprefix: title.title,
			apnamespace: title.namespace,
			aplimit: 'max',
			...otherParams,
		}).then((data) => {
			return data.query.allpages.map((pg: ApiPage) => pg.title);
		});
	}

	/**
	 * Get pages in a category
	 * @param {string} category - name of category, with or without namespace prefix
	 * @param {Object} [otherParams]
	 * @returns {Promise<string[]>}
	 */
	async getPagesInCategory(category: string, otherParams?: ApiQueryCategoryMembersParams): Promise<string[]> {
		const title = this.Title.newFromText(category, 14);
		return this.request({
			action: 'query',
			list: 'categorymembers',
			cmtitle: title.toText(),
			cmlimit: 'max',
			...otherParams,
		}).then((data) => {
			return data.query.categorymembers.map((pg: ApiPage) => pg.title);
		});
	}

	/**
	 * Search the wiki.
	 * @param {string} searchTerm
	 * @param {number} limit
	 * @param {("size"|"timestamp"|"wordcount"|"snippet"|"redirectitle"|"sectiontitle"|
	 * "redirectsnippet"|"titlesnippet"|"sectionsnippet"|"categorysnippet")[]} props
	 * @param {Object} otherParams
	 * @returns {Promise<Object>}
	 */
	async search(
		searchTerm: string,
		limit = 50,
		props?: ApiQuerySearchParams['srprop'],
		otherParams?: ApiQuerySearchParams
	): Promise<ApiSearchResult[]> {
		return this.request({
			action: 'query',
			list: 'search',
			srsearch: searchTerm,
			srlimit: limit,
			srprop: props || ['size', 'wordcount', 'timestamp'],
			...otherParams,
		}).then((data) => {
			return data.query.search;
		});
	}

	/************* BULK PROCESSING FUNCTIONS ************/

	/**
	 * Send an API query that automatically continues till the limit is reached.
	 *
	 * @param {Object} query - The API query
	 * @param {number} [limit=10] - limit on the maximum number of API calls to go through
	 * @returns {Promise<Object[]>} - resolved with an array of responses of individual calls.
	 */
	continuedQuery(query?: ApiParams, limit = 10): Promise<ApiResponse[]> {
		let responses: ApiResponse[] = [];
		let callApi = (query: ApiParams, count: number): Promise<ApiResponse[]> => {
			return this.request(query).then((response) => {
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
	 * Generator to iterate through API response continuations.
	 * @generator
	 * @param {Object} query
	 * @param {number} [limit=Infinity]
	 * @yields {Object} a single page of the response
	 */
	async *continuedQueryGen(query?: ApiParams, limit = Infinity): AsyncGenerator<ApiResponse> {
		let response: ApiResponse = { continue: {} };
		for (let i = 0; i < limit; i++) {
			if (response.continue) {
				response = await this.request(merge(query, response.continue));
				yield response;
			} else {
				break;
			}
		}
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
	 * The API calls are made via POST instead of GET to avoid potential 414 (URI
	 * too long) errors.
	 *
	 * @param {Object} query - the query object, the multi-input field should
	 * be an array
	 * @param {string} [batchFieldName=titles] - the name of the multi-input field
	 *
	 * @returns {Promise<Object[]>} - promise resolved when all the API queries have
	 * settled, with the array of responses.
	 */
	massQuery(query?: ApiParams, batchFieldName = 'titles'): Promise<ApiResponse[]> {
		let batchValues = query[batchFieldName];
		if (!Array.isArray(batchValues)) {
			throw new Error(`massQuery: batch field in query must be an array`);
		}
		const limit = this.hasApiHighLimit ? 500 : 50;
		const numBatches = Math.ceil(batchValues.length / limit);
		let batches = new Array(numBatches);
		for (let i = 0; i < numBatches - 1; i++) {
			batches[i] = new Array(limit);
		}
		batches[numBatches - 1] = new Array(batchValues.length % limit);
		for (let i = 0; i < batchValues.length; i++) {
			batches[Math.floor(i / limit)][i % limit] = batchValues[i];
		}
		let responses = new Array(numBatches);
		return new Promise((resolve) => {
			const sendQuery = (idx: number) => {
				if (idx === numBatches) {
					return resolve(responses);
				}
				query[batchFieldName] = batches[idx];
				this.request(query, { method: 'post' })
					.then(
						(response) => {
							responses[idx] = response;
						},
						(err: MwnError) => {
							responses[idx] = err;
						}
					)
					.finally(() => {
						sendQuery(idx + 1);
					});
			};
			sendQuery(0);
		});
	}

	/**
	 * Generator version of massQuery(). Iterate through pages of API results.
	 * @param {Object} query
	 * @param {string} [batchFieldName=titles]
	 * @param {number} [batchSize]
	 */
	async *massQueryGen(query: ApiParams, batchFieldName = 'titles', batchSize?: number): AsyncGenerator<ApiResponse> {
		let batchValues = query[batchFieldName];
		if (!Array.isArray(batchValues)) {
			throw new Error(`massQuery: batch field in query must be an array`);
		}
		const limit = batchSize || (this.hasApiHighLimit ? 500 : 50);
		const batches = arrayChunk(<string[]>batchValues, limit);
		const numBatches = batches.length;

		for (let i = 0; i < numBatches; i++) {
			query[batchFieldName] = batches[i];
			yield await this.request(query, { method: 'post' });
		}
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
	batchOperation<T>(
		list: T[],
		worker: (item: T, index: number) => Promise<any>,
		concurrency = 5,
		retries = 0
	): Promise<{ failures: { [item: string]: Error } }> {
		let counts = {
			successes: 0,
			failures: 0,
		};
		let failures: { item: T; error: Error }[] = [];
		let incrementSuccesses = () => {
			counts.successes++;
		};
		const incrementFailures = (item: T, error: Error) => {
			counts.failures++;
			failures.push({ item, error });
		};
		const updateStatusText = () => {
			const percentageFinished = Math.round(((counts.successes + counts.failures) / list.length) * 100);
			const percentageSuccesses = Math.round((counts.successes / (counts.successes + counts.failures)) * 100);
			const statusText = `[+] Finished ${counts.successes + counts.failures}/${
				list.length
			} (${percentageFinished}%) tasks, of which ${
				counts.successes
			} (${percentageSuccesses}%) were successful, and ${counts.failures} failed.`;
			if (!this.options.silent) {
				log(statusText);
			}
		};
		const numBatches = Math.ceil(list.length / concurrency);

		return new Promise((resolve) => {
			const sendBatch = (batchIdx: number) => {
				// Last batch
				if (batchIdx === numBatches - 1) {
					const numItemsInLastBatch = list.length - batchIdx * concurrency;
					const finalBatchPromises = new Array(numItemsInLastBatch);

					// Hack: Promise.allSettled requires NodeJS 12.9+
					// so we create a new array finalBatchSettledPromises containing promises
					// which are resolved irrespective of whether the corresponding
					// finalBatchPromises are resolved or rejected.
					let finalBatchSettledPromises = new Array(numItemsInLastBatch);

					for (let i = 0; i < numItemsInLastBatch; i++) {
						let idx = batchIdx * concurrency + i;
						finalBatchPromises[i] = worker(list[idx], idx);
						if (!ispromise(finalBatchPromises[i])) {
							throw new Error('batchOperation worker function must return a promise');
						}
						finalBatchSettledPromises[i] = new Promise((resolve) => {
							return finalBatchPromises[i].then(resolve, resolve);
						});
						finalBatchPromises[i]
							.then(incrementSuccesses, (err: Error) => {
								incrementFailures(list[idx], err);
							})
							.finally(function () {
								updateStatusText();
								finalBatchSettledPromises[i] = Promise.resolve();
							});
					}
					Promise.all(finalBatchSettledPromises).then(() => {
						if (counts.failures !== 0 && retries > 0) {
							resolve(
								this.batchOperation(
									failures.map((f) => f.item),
									worker,
									concurrency,
									retries - 1
								)
							);
						} else {
							let keyedFailuresObject: { [item: string]: Error } = {};
							for (let { item, error } of failures) {
								keyedFailuresObject[String(item)] = error;
							}
							resolve({ failures: keyedFailuresObject });
						}
					});
					return;
				}

				for (let i = 0; i < concurrency; i++) {
					let idx = batchIdx * concurrency + i;

					const promise = worker(list[idx], idx);
					if (!ispromise(promise)) {
						throw new Error('batchOperation worker function must return a promise');
					}
					promise
						.then(incrementSuccesses, (err: Error) => {
							incrementFailures(list[idx], err);
						})
						.finally(() => {
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
	 * Using this with delay=0 is same as using batchOperation with batchSize=1
	 * Use of seriesBatchOperation() is not recommended for MediaWiki API actions. Use the
	 * normal mwn methods with async-await in a for loop. The request() method has the better
	 * retry functionality (only network errors are retried, other errors are unlikely to go
	 * away on retries).
	 * @param {Array} list
	 * @param {Function} worker - must return a promise
	 * @param {number} [delay=5000] - number of milliseconds of delay
	 * @param {number} [retries=0] - max number of times failing actions should be retried.
	 * @returns {Promise<Object>} - resolved when all API calls have finished, with object
	 * { failures: { failed item: error, failed item2: error2, ... } }
	 */
	async seriesBatchOperation<T>(
		list: T[],
		worker: (item: T, index: number) => Promise<any>,
		delay = 5000,
		retries = 0
	): Promise<{ failures: { [item: string]: Error } }> {
		let counts = {
			successes: 0,
			failures: 0,
		};
		let failures: { item: T; err: Error }[] = [];
		const incrementSuccesses = () => {
			counts.successes++;
		};
		const incrementFailures = (item: T, err: Error) => {
			counts.failures++;
			failures.push({ item, err });
		};
		const updateStatusText = () => {
			const percentageFinished = Math.round(((counts.successes + counts.failures) / list.length) * 100);
			const percentageSuccesses = Math.round((counts.successes / (counts.successes + counts.failures)) * 100);
			const statusText = `[+] Finished ${counts.successes + counts.failures}/${
				list.length
			} (${percentageFinished}%) tasks, of which ${
				counts.successes
			} (${percentageSuccesses}%) were successful, and ${counts.failures} failed.`;
			if (!this.options.silent) {
				log(statusText);
			}
		};

		let worklist = list;
		for (let r = 0; r <= retries; r++) {
			if (r !== 0) {
				if (counts.failures === 0) {
					break;
				}
				worklist = failures.map((f) => f.item);
				failures = [];
				(counts.successes = 0), (counts.failures = 0);
			}
			for (let idx = 0; idx < worklist.length; idx++) {
				await worker(worklist[idx], idx).then(incrementSuccesses, function (err) {
					incrementFailures(worklist[idx], err);
				});
				updateStatusText();
				if (delay !== 0) {
					await sleep(delay);
				}
			}
		}

		let errors: { [item: string]: Error } = {};
		for (let { item, err } of failures) {
			errors[String(item)] = err;
		}
		return { failures: errors };
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
	askQuery(query: string, apiUrl: string, customRequestOptions?: RawRequestParams): Promise<any> {
		apiUrl = apiUrl || this.options.apiUrl;

		let requestOptions = merge(
			{
				method: 'get',
				url: apiUrl,
				responseType: 'json',
				params: {
					action: 'ask',
					format: 'json',
					query: query,
				},
			},
			customRequestOptions
		);

		return this.rawRequest(requestOptions).then((response) => response.data);
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
	sparqlQuery(query: string, endpointUrl: string, customRequestOptions?: RawRequestParams): Promise<any> {
		endpointUrl = endpointUrl || this.options.apiUrl;

		let requestOptions = merge(
			{
				method: 'get',
				url: endpointUrl,
				responseType: 'json',
				params: {
					format: 'json',
					query: query,
				},
			},
			customRequestOptions
		);

		return this.rawRequest(requestOptions).then((response) => response.data);
	}

	/**
	 * Gets ORES predictions from revision IDs
	 * @param {string} endpointUrl
	 * @param {string[]} models
	 * @param {string[]|number[]|string|number} revisions  ID(s)
	 * @deprecated as ORES has been deprecated in favours of Lift Wing.
	 */
	oresQueryRevisions(
		endpointUrl: string,
		models: string[],
		revisions: string[] | number[] | string | number
	): Promise<any> {
		let response = {};
		const revs = revisions instanceof Array ? revisions : [revisions];
		const batchSize = Math.floor(20 / models.length);
		const chunks = arrayChunk(revs, batchSize);
		return this.seriesBatchOperation(
			chunks,
			(chunk) => {
				return this.rawRequest({
					method: 'get',
					url: endpointUrl,
					params: {
						models: models.join('|'),
						revids: chunk.join('|'),
					},
					responseType: 'json',
				}).then((oresResponse) => {
					Object.assign(response, Object.values<ApiResponseSubType>(oresResponse.data)[0].scores);
				});
			},
			0,
			2
		).then(() => {
			return response;
		});
	}

	/**
	 * Promisified version of setTimeout
	 * @param {number} duration - of sleep in milliseconds
	 */
	sleep = sleep;
}

/** @deprecated Use {@link Mwn} instead **/
export class mwn extends Mwn {}
