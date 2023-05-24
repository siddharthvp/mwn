/**
 * The entry point for all API calls to wikis is the
 * mwn#request() method in bot.ts. This function uses
 * the Request and Response classes defined in this file.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import * as FormData from 'form-data';
import * as OAuth from 'oauth-1.0a';

import type { ApiParams, mwn } from './bot';
import { log } from './log';
import { MwnError, rejectWithError } from './error';
import { merge, mergeDeep1, sleep } from './utils';
import { ApiResponse } from './api_response_types';

axiosCookieJarSupport(axios);

export interface RawRequestParams extends AxiosRequestConfig {
	retryNumber?: number;
}

export class Request {
	apiParams: ApiParams;
	requestParams: RawRequestParams;
	bot: mwn;
	constructor(bot: mwn, apiParams: ApiParams, requestParams: RawRequestParams) {
		this.bot = bot;
		this.apiParams = apiParams;
		this.requestParams = requestParams;
	}

	async process() {
		this.apiParams = merge(this.bot.options.defaultParams, this.apiParams);
		this.preprocessParams();
		await this.fillRequestOptions();
	}

	getMethod() {
		if (this.apiParams.action === 'query') {
			return 'get';
		}
		if (this.apiParams.action === 'parse' && !this.apiParams.text) {
			return 'get';
		}
		return 'post';
	}

	MULTIPART_THRESHOLD = 8000;

	hasLongFields = false;

	preprocessParams() {
		let params = this.apiParams;
		Object.entries(params).forEach(([key, val]) => {
			if (Array.isArray(val)) {
				if (!val.join('').includes('|')) {
					params[key] = val.join('|');
				} else {
					params[key] = '\x1f' + val.join('\x1f');
				}
			}
			if (val === false || val === undefined) {
				delete params[key];
			} else if (val === true) {
				params[key] = '1'; // booleans cause error with multipart/form-data requests
			} else if (val instanceof Date) {
				params[key] = val.toISOString();
			} else if (String(params[key]).length > this.MULTIPART_THRESHOLD) {
				// use multipart/form-data if there are large fields, for better performance
				this.hasLongFields = true;
			}
		});
	}

	async fillRequestOptions() {
		let method = this.getMethod();
		this.requestParams = mergeDeep1(
			{
				url: this.bot.options.apiUrl,
				method,

				// retryNumber isn't actually used by the API, but this is
				// included here for tracking our maxlag retry count.
				retryNumber: 0,
			},
			this.bot.requestOptions,
			this.requestParams
		);

		if (method === 'get') {
			this.handleGet();
		} else {
			await this.handlePost();
		}
		this.applyAuthentication();
	}

	applyAuthentication() {
		let requestOptions = this.requestParams;

		if (this.bot.usingOAuth2) {
			// OAuth 2 authentication
			requestOptions.headers['Authorization'] = `Bearer ${this.bot.options.OAuth2AccessToken}`;
		} else if (this.bot.usingOAuth) {
			// OAuth 1a authentication
			requestOptions.headers = {
				...requestOptions.headers,
				...this.makeOAuthHeader({
					url: requestOptions.url,
					method: requestOptions.method,
					data: requestOptions.data instanceof FormData ? {} : this.apiParams,
				}),
			};
		} else {
			// BotPassword authentication
			requestOptions.jar = this.bot.cookieJar;
			requestOptions.withCredentials = true;
		}
	}

	/**
	 * Get OAuth Authorization header
	 */
	makeOAuthHeader(params: OAuth.RequestOptions): OAuth.Header {
		return this.bot.oauth.toHeader(
			this.bot.oauth.authorize(params, {
				key: this.bot.options.OAuthCredentials.accessToken,
				secret: this.bot.options.OAuthCredentials.accessSecret,
			})
		);
	}

	handleGet() {
		// axios takes care of stringifying to URL query string
		this.requestParams.params = this.apiParams;
	}

	async handlePost() {
		// Shift the token to the end of the query string, to prevent
		// incomplete data sent from being accepted meaningfully by the server
		let params = this.apiParams;
		if (params.token) {
			let token = params.token;
			delete params.token;
			params.token = token;
		}

		if (this.useMultipartFormData()) {
			await this.handlePostMultipartFormData();
		} else {
			// use application/x-www-form-urlencoded (default)
			// requestOptions.data = params;
			this.requestParams.data = Object.entries(params)
				.map(([key, val]) => {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val as string);
				})
				.join('&');
		}
	}

	useMultipartFormData() {
		let ctype = this.requestParams?.headers?.['Content-Type'];
		if (ctype === 'multipart/form-data') {
			return true;
		} else if (this.hasLongFields && ctype === undefined) {
			return true;
		}
		return false;
	}

	async handlePostMultipartFormData() {
		let params = this.apiParams,
			requestOptions = this.requestParams;
		let form = new FormData();
		for (let [key, val] of Object.entries(params)) {
			if (val instanceof Object && 'stream' in val) {
				// TypeScript facepalm
				form.append(key, val.stream, val.name);
			} else {
				form.append(key, val);
			}
		}
		requestOptions.data = form;
		requestOptions.headers = await new Promise((resolve, reject) => {
			form.getLength((err, length) => {
				if (err) {
					reject(err);
				}
				resolve({
					...requestOptions.headers,
					...form.getHeaders(),
					'Content-Length': length,
				});
			});
		});
	}
}

export class Response {
	bot: mwn;
	params: ApiParams;
	requestOptions: RawRequestParams;
	rawResponse: AxiosResponse<ApiResponse>;
	response: ApiResponse;

	constructor(bot: mwn, params: ApiParams, requestOptions: RawRequestParams) {
		this.bot = bot;
		this.params = params;
		this.requestOptions = requestOptions;
	}

	async process(rawResponse: AxiosResponse<ApiResponse>) {
		this.rawResponse = rawResponse;
		this.response = rawResponse.data;
		await this.initialCheck();
		this.showWarnings();
		return (await this.handleErrors()) || this.response;
	}

	async initialCheck(): Promise<void> {
		if (typeof this.response !== 'object') {
			if (this.params.format !== 'json') {
				return rejectWithError({
					code: 'mwn_invalidformat',
					info: 'Must use format=json!',
					response: this.response,
				});
			}
			return rejectWithError({
				code: 'invalidjson',
				info: 'No valid JSON response',
				response: this.response,
			});
		}
	}

	showWarnings() {
		if (this.response.warnings && !this.bot.options.suppressAPIWarnings) {
			if (Array.isArray(this.response.warnings)) {
				// new error formats
				for (let { code, module, info, html, text } of this.response.warnings) {
					if (code === 'deprecation-help') {
						// skip
						continue;
					}
					const msg =
						info || // errorformat=bc
						text || // errorformat=wikitext/plaintext
						html; // errorformat=html
					log(`[W] Warning received from API: ${module}: ${msg}`);
				}
			} else {
				// legacy error format (bc)
				for (let [key, info] of Object.entries(this.response.warnings)) {
					// @ts-ignore
					log(`[W] Warning received from API: ${key}: ${info.warnings}`);
				}
			}
		}
	}

	async handleErrors(): Promise<void | ApiResponse> {
		let error =
			this.response.error || // errorformat=bc (default)
			this.response.errors?.[0]; // other error formats
		if (error) {
			error = new MwnError(error);

			if (this.requestOptions.retryNumber < this.bot.options.maxRetries) {
				switch (error.code) {
					// This will not work if the token type to be used is defined by an
					// extension, and not a part of mediawiki core
					case 'badtoken':
						log(`[W] Encountered badtoken error, fetching new token and retrying`);
						return Promise.all([
							this.bot.getTokenType(this.params.action as string),
							this.bot.getTokens(),
						]).then(([tokentype]) => {
							if (!tokentype || !this.bot.state[tokentype + 'token']) {
								return this.dieWithError(error);
							}
							this.params.token = this.bot.state[tokentype + 'token'];
							return this.retry();
						});

					case 'readonly':
						log(
							`[W] Encountered readonly error, waiting for ${
								this.bot.options.retryPause / 1000
							} seconds before retrying`
						);
						return sleep(this.bot.options.retryPause).then(() => {
							return this.retry();
						});

					case 'maxlag':
						// Handle maxlag, see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
						// eslint-disable-next-line no-case-declarations
						let pause = parseInt(this.rawResponse.headers['retry-after']); // axios uses lowercase headers
						// retry-after appears to be usually 5 for WMF wikis
						if (isNaN(pause)) {
							pause = this.bot.options.retryPause / 1000;
						}

						log(
							`[W] Encountered maxlag: ${error.lag} seconds lagged. Waiting for ${pause} seconds before retrying`
						);
						return sleep(pause * 1000).then(() => {
							return this.retry();
						});

					case 'assertbotfailed':
					case 'assertuserfailed':
						// this shouldn't have happened if we're using OAuth
						if (this.bot.usingOAuth) {
							return this.dieWithError(error);
						}

						// Possibly due to session loss: retry after logging in again
						log(`[W] Received ${error.code}, attempting to log in and retry`);
						return this.bot.login().then(() => {
							return this.retry();
						});

					case 'mwoauth-invalid-authorization':
						// Per https://phabricator.wikimedia.org/T106066, "Nonce already used" indicates
						// an upstream memcached/redis failure which is transient
						// Also handled in mwclient (https://github.com/mwclient/mwclient/pull/165/commits/d447c333e)
						// and pywikibot (https://gerrit.wikimedia.org/r/c/pywikibot/core/+/289582/1/pywikibot/data/api.py)
						// Some discussion in https://github.com/mwclient/mwclient/issues/164
						if (error.info.includes('Nonce already used')) {
							log(
								`[W] Retrying failed OAuth authentication in ${
									this.bot.options.retryPause / 1000
								} seconds`
							);
							return sleep(this.bot.options.retryPause).then(() => {
								return this.retry();
							});
						} else {
							return this.dieWithError(error);
						}

					default:
						return this.dieWithError(error);
				}
			} else {
				return this.dieWithError(error);
			}
		}
	}

	retry() {
		this.requestOptions.retryNumber += 1;
		return this.bot.request(this.params, this.requestOptions);
	}

	dieWithError(error: any): Promise<never> {
		let response = this.rawResponse,
			requestOptions = this.requestOptions;
		let errorData = Object.assign({}, error, {
			// Enhance error object with additional information:
			// the full API response: everything in AxiosResponse object except
			// config (not needed) and request (included as errorData.request instead)
			response: {
				data: response.data,
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			},
			// the original request, should the client want to retry the request
			request: requestOptions,
		});
		return rejectWithError(errorData);
	}

	/**
	 * This handles errors at the network level
	 * @param {Object} error
	 */
	handleRequestFailure(error: any) {
		if (
			!error.disableRetry &&
			!(error instanceof TypeError) &&
			this.requestOptions.retryNumber < this.bot.options.maxRetries &&
			// ENOTFOUND usually means bad apiUrl is provided, retrying is pointless and annoying
			error.code !== 'ENOTFOUND' &&
			(!error.response?.status ||
				// Vaguely retriable error codes
				[408, 409, 425, 429, 500, 502, 503, 504].includes(error.response.status))
		) {
			// error might be transient, give it another go!
			log(`[W] Encountered ${error}, retrying in ${this.bot.options.retryPause / 1000} seconds`);
			console.log(error); // log the full error for upstream reporting if required
			return sleep(this.bot.options.retryPause).then(() => {
				return this.retry();
			});
		}

		error.request = this.requestOptions;
		return rejectWithError(error);
	}
}
