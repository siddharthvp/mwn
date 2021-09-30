import { MwnError } from './error';

import type { mwn, MwnTitle } from './bot';
import type {
	ApiDeleteParams,
	ApiEditPageParams,
	ApiMoveParams,
	ApiPurgeParams,
	ApiQueryAllPagesParams,
	ApiQueryLogEventsParams,
	ApiQueryRevisionsParams,
	ApiUndeleteParams,
	WikibaseClientApiDescriptionParams,
} from './api_params';
import { ApiPage, ApiParseResponse, ApiRevision, LogEvent } from './api_response_types';

export interface MwnPageStatic {
	new (title: MwnTitle | string, namespace?: number): MwnPage;
}

export interface MwnPage extends MwnTitle {
	data: any;
	getTalkPage(): MwnPage;
	getSubjectPage(): MwnPage;
	/**
	 * Check if page exists.
	 */
	exists(): Promise<boolean>;
	/**
	 * Get page wikitext
	 */
	text(): Promise<string>;
	/**
	 * Get page categories
	 * @returns {Promise<Object[]>} Resolved with array of objects like
	 * { sortkey: '...', category: '...', hidden: true }
	 */
	categories(): Promise<ApiParseResponse['categories']>;
	/**
	 * Get templates transcluded on the page
	 * @returns {Promise<Object[]>} Resolved with array of objects like
	 * { ns: 10, title: 'Template:Cite web', exists: true }
	 */
	templates(): Promise<ApiParseResponse['templates']>;
	/**
	 * Get links on the page
	 * @returns {Promise<Object[]>} Resolved with array of objects like
	 * { ns: 0, title: 'Main Page', exists: true }
	 */
	links(): Promise<ApiParseResponse['links']>;
	/**
	 * Get list of pages linking to this page
	 * @returns {Promise<String[]>}
	 */
	backlinks(): Promise<string[]>;
	/**
	 * Get list of pages transcluding this page
	 * @returns {Promise<String[]>}
	 */
	transclusions(): Promise<string[]>;
	/**
	 * Returns list of images on the page
	 * @returns {Promise<String[]>} - array elements don't include File: prefix
	 */
	images(): Promise<string[]>;
	/**
	 * Returns list of external links on the page
	 * @returns {Promise<String[]>}
	 */
	externallinks(): Promise<string[]>;
	/**
	 * Returns list of subpages of the page
	 * @returns {Promise<String[]>}
	 */
	subpages(options?: ApiQueryAllPagesParams): Promise<string[]>;
	/**
	 * Check if page is redirect or not
	 * @returns {Promise<boolean>}
	 */
	isRedirect(): Promise<boolean>;
	/**
	 * Get redirect target.
	 * Returns the same page name if the page is not a redirect.
	 * @returns {Promise<string>}
	 */
	getRedirectTarget(): Promise<string>;
	/**
	 * Get username of the page creator
	 * @returns {Promise<string>}
	 */
	getCreator(): Promise<string>;
	/**
	 * Get username of the last deleting admin (or null)
	 * @returns {Promise<string>}
	 */
	getDeletingAdmin(): Promise<string>;
	/**
	 * Get short description, either the local one (for English Wikipedia)
	 * or the one from wikidata.
	 * @param {Object} customOptions
	 * @returns {Promise<string>}
	 */
	getDescription(customOptions?: any): Promise<string>;
	/**
	 * Get the edit history of the page
	 * @param {string|string[]} props - revision properties to fetch, by default content is
	 * excluded
	 * @param {number} [limit=50] - number of revisions to fetch data about
	 * @param {Object} customOptions - custom API options
	 * @returns {Promise<Object[]>} - resolved with array of objects representing
	 * revisions, eg. { revid: 951809097, parentid: 951809097, timestamp:
	 * "2020-04-19T00:45:35Z", comment: "Edit summary" }
	 */
	history(
		props: ApiQueryRevisionsParams['rvprop'],
		limit: number,
		customOptions?: ApiQueryRevisionsParams
	): Promise<ApiRevision[]>;
	historyGen(
		props: ApiQueryRevisionsParams['rvprop'],
		customOptions?: ApiQueryRevisionsParams
	): AsyncGenerator<ApiRevision>;
	/**
	 * Get the page logs.
	 * @param {string|string[]} props - data about log entries to fetch
	 * @param {number} limit - max number of log entries to fetch
	 * @param {string} type - type of log to fetch, can either be an letype or leaction
	 * Leave undefined (or null) to fetch all log types
	 * @param {Object} customOptions
	 * @returns {Promise<Object[]>} - resolved with array of objects representing
	 * log entries, eg. { ns: '0', title: 'Main Page', type: 'delete', user: 'Example',
	 * action: 'revision', timestamp: '2020-05-05T17:13:34Z', comment: 'edit summary' }
	 */
	logs(
		props: ApiQueryLogEventsParams['leprop'],
		limit?: number,
		type?: string,
		customOptions?: ApiQueryLogEventsParams
	): Promise<LogEvent[]>;
	logsGen(
		props: ApiQueryLogEventsParams['leprop'],
		type?: string,
		customOptions?: ApiQueryLogEventsParams
	): AsyncGenerator<LogEvent>;
	/**
	 * Get page views data (only for Wikimedia wikis)
	 * @see https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews
	 * @param options
	 */
	pageViews(options?: PageViewOptions): Promise<PageViewData[]>;
	/**
	 * Query the top contributors to the article using the WikiWho API.
	 * This API has a throttling of 2000 requests a day.
	 * Supported for EN, DE, ES, EU, TR Wikipedias only
	 * @see https://api.wikiwho.net/
	 */
	queryAuthors(): Promise<AuthorshipData>;
	edit(transform: (rev: { content: string; timestamp: string }) => string | ApiEditPageParams): Promise<any>;
	save(text: string, summary?: string, options?: ApiEditPageParams): Promise<any>;
	newSection(header: string, message: string, additionalParams?: ApiEditPageParams): Promise<any>;
	move(target: string, summary: string, options?: ApiMoveParams): Promise<any>;
	delete(summary: string, options?: ApiDeleteParams): Promise<any>;
	undelete(summary: string, options?: ApiUndeleteParams): Promise<any>;
	purge(options?: ApiPurgeParams): Promise<any>;
}

export default function (bot: mwn): MwnPageStatic {
	class Page extends bot.title implements MwnPage {
		data: any;

		constructor(title: MwnTitle | string, namespace?: number) {
			// bot property is set by mwn#page() method
			if (title instanceof bot.title) {
				super(title.title, title.namespace);
			} else {
				super(title, namespace);
			}
			this.data = {};
		}

		/**
		 * @override
		 */
		getTalkPage(): Page {
			return new Page(super.getTalkPage());
		}

		/**
		 * @override
		 */
		getSubjectPage(): Page {
			return new Page(super.getSubjectPage());
		}

		/**** Get operations *****/

		/** @inheritDoc */
		exists(): Promise<boolean> {
			return bot
				.query({
					titles: this.toString(),
				})
				.then((data) => {
					return data.query.pages[0].missing !== true;
				});
		}

		/** @inheritDoc */
		text(): Promise<string> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'wikitext',
				})
				.then((data) => {
					this.data.text = data.parse.wikitext;
					return data.parse.wikitext;
				});
		}

		/** @inheritDoc */
		categories(): Promise<ApiParseResponse['categories']> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'categories',
				})
				.then((data) => data.parse.categories);
		}

		/** @inheritDoc */
		templates(): Promise<ApiParseResponse['templates']> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'templates',
				})
				.then((data) => data.parse.templates);
		}

		/** @inheritDoc */
		links(): Promise<ApiParseResponse['links']> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'links',
				})
				.then((data) => data.parse.links);
		}

		/** @inheritDoc */
		backlinks(): Promise<string[]> {
			return bot
				.continuedQuery({
					action: 'query',
					prop: 'linkshere',
					titles: this.toString(),
					lhprop: 'title',
					lhlimit: 'max',
				})
				.then((jsons) => {
					let pages = jsons.reduce((pages, json) => pages.concat(json.query.pages), []);
					let page = pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return page.linkshere.map((pg: ApiPage) => pg.title);
				});
		}

		/** @inheritDoc */
		transclusions(): Promise<string[]> {
			return bot
				.continuedQuery({
					action: 'query',
					prop: 'transcludedin',
					titles: this.toString(),
					tiprop: 'title',
					tilimit: 'max',
				})
				.then((jsons) => {
					let pages = jsons.reduce((pages, json) => pages.concat(json.query.pages), []);
					let page = pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return page.transcludedin.map((pg: ApiPage) => pg.title);
				});
		}

		/** @inheritDoc */
		images(): Promise<string[]> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'images',
				})
				.then((data) => data.parse.images);
		}

		/** @inheritDoc */
		externallinks(): Promise<string[]> {
			return bot
				.request({
					action: 'parse',
					page: this.toString(),
					prop: 'externallinks',
				})
				.then((data) => data.parse.externallinks);
		}

		/** @inheritDoc */
		subpages(options?: ApiQueryAllPagesParams): Promise<string[]> {
			return bot
				.request({
					action: 'query',
					list: 'allpages',
					apprefix: this.title + '/',
					apnamespace: this.namespace,
					aplimit: 'max',
					...options,
				})
				.then((data) => {
					return data.query.allpages.map((pg: ApiPage) => pg.title);
				});
		}

		/** @inheritDoc */
		isRedirect(): Promise<boolean> {
			return this.getRedirectTarget().then((target) => {
				return this.toText() !== target;
			});
		}

		/** @inheritDoc */
		getRedirectTarget(): Promise<string> {
			if (this.data.text) {
				let target = /^\s*#redirect \[\[(.*?)\]\]/.exec(this.data.text);
				if (!target) {
					return Promise.resolve(this.toText());
				}
				return Promise.resolve(new bot.title(target[1]).toText());
			}
			return bot
				.request({
					action: 'query',
					titles: this.toString(),
					redirects: '1',
				})
				.then((data) => {
					let page = data.query.pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return page.title;
				});
		}

		/** @inheritDoc */
		getCreator(): Promise<string> {
			return bot
				.request({
					action: 'query',
					titles: this.toString(),
					prop: 'revisions',
					rvprop: 'user',
					rvlimit: 1,
					rvdir: 'newer',
				})
				.then((data) => {
					let page = data.query.pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return page.revisions[0].user;
				});
		}

		/** @inheritDoc */
		getDeletingAdmin(): Promise<string> {
			return bot
				.request({
					action: 'query',
					list: 'logevents',
					leaction: 'delete/delete',
					letitle: this.toString(),
					lelimit: 1,
				})
				.then((data) => {
					let logs = data.query.logevents;
					if (logs.length === 0) {
						return null;
					}
					return logs[0].user;
				});
		}

		/** @inheritDoc */
		getDescription(customOptions: WikibaseClientApiDescriptionParams) {
			// ApiParams
			return bot
				.request({
					action: 'query',
					prop: 'description',
					titles: this.toString(),
					...customOptions,
				})
				.then((data) => {
					let page = data.query.pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return data.query.pages[0].description;
				});
		}

		/** @inheritDoc */
		history(
			props: ApiQueryRevisionsParams['rvprop'],
			limit = 50,
			customOptions?: ApiQueryRevisionsParams
		): Promise<ApiRevision[]> {
			return bot
				.request({
					action: 'query',
					prop: 'revisions',
					titles: this.toString(),
					rvprop: props || 'ids|timestamp|flags|comment|user',
					rvlimit: limit || 50,
					...customOptions,
				})
				.then((data) => {
					let page = data.query.pages[0];
					if (page.missing) {
						return Promise.reject(new MwnError.MissingPage());
					}
					return data.query.pages[0].revisions;
				});
		}

		async *historyGen(
			props: ApiQueryRevisionsParams['rvprop'],
			customOptions?: ApiQueryRevisionsParams
		): AsyncGenerator<ApiRevision> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				prop: 'revisions',
				titles: this.toString(),
				rvprop: props || 'ids|timestamp|flags|comment|user',
				rvlimit: 50,
				...customOptions,
			});
			for await (let json of continuedQuery) {
				for (let edit of json.query.pages[0].revisions) {
					yield edit;
				}
			}
		}

		/** @inheritDoc */
		logs(
			props: ApiQueryLogEventsParams['leprop'],
			limit?: number,
			type?: string,
			customOptions?: ApiQueryLogEventsParams
		): Promise<LogEvent[]> {
			let logtypeObj: ApiQueryLogEventsParams = {};
			if (type) {
				logtypeObj = { [type.includes('/') ? 'leaction' : 'letype']: type };
			}
			return bot
				.request({
					action: 'query',
					list: 'logevents',
					...logtypeObj,
					leprop: props || 'title|type|user|timestamp|comment',
					letitle: this.toString(),
					lelimit: limit || 50,
					...customOptions,
				})
				.then((data) => {
					return data.query.logevents;
				});
		}

		async *logsGen(
			props: ApiQueryLogEventsParams['leprop'],
			type?: string,
			customOptions?: ApiQueryLogEventsParams
		): AsyncGenerator<LogEvent> {
			let logtypeObj: ApiQueryLogEventsParams = {};
			if (type) {
				logtypeObj = { [type.includes('/') ? 'leaction' : 'letype']: type };
			}
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'logevents',
				...logtypeObj,
				leprop: props || 'title|type|user|timestamp|comment',
				letitle: this.toString(),
				lelimit: 50,
				...customOptions,
			});
			for await (let json of continuedQuery) {
				for (let event of json.query.logevents) {
					yield event;
				}
			}
		}

		/** @inheritDoc */
		async pageViews(options: PageViewOptions = {}): Promise<PageViewData[]> {
			let project = bot.options.apiUrl.match(/.*\/(.*?)\.(?:org|com|net)/)?.[1];
			if (!project) {
				throw new Error('Invalid API URL for using pageViews(). Only Wikimedia wikis are supported.');
			}

			// Set defaults
			let { access, agent, granularity, start, end } = options;
			access = access || 'all-access';
			agent = agent || 'all-agents';
			granularity = granularity || 'monthly';
			if (granularity === 'daily') {
				let date = new bot.date();
				date.setUTCDate(date.getUTCDate() - 1);
				start = start || date;
				end = end || new bot.date();
			} else if (granularity === 'monthly') {
				let date = new bot.date();
				date.setUTCDate(1);
				date.setUTCMonth(date.getUTCMonth() - 1);
				start = start || date;
				end = end || new bot.date().setUTCDate(1);
			}

			let startString = new bot.date(start).format('YYYYMMDD'),
				endString = new bot.date(end).format('YYYYMMDD');

			return bot
				.rawRequest({
					url: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${project}/${access}/${agent}/${encodeURIComponent(
						this.toString()
					)}/${granularity}/${startString}/${endString}`,
					headers: {
						'User-Agent': bot.options.userAgent,
					},
				})
				.then((response) => {
					return response.data.items;
				});
		}

		/** @inheritDoc */
		async queryAuthors(): Promise<AuthorshipData> {
			let langcodematch = bot.options.apiUrl.match(/([^/]*?)\.wikipedia\.org/);
			if (!langcodematch || !langcodematch[1]) {
				throw new Error('WikiWho API is not supported for bot API URL. Re-check.');
			}

			let json;
			try {
				json = await bot
					.rawRequest({
						url: `https://api.wikiwho.net/${
							langcodematch[1]
						}/api/v1.0.0-beta/latest_rev_content/${encodeURIComponent(this.toString())}/?editor=true`,
						headers: {
							'User-Agent': bot.options.userAgent,
						},
					})
					.then((response) => response.data);
			} catch (err) {
				throw new Error(err && err.response && err.response.data && err.response.data.Error);
			}

			const tokens = Object.values(json.revisions[0])[0].tokens;

			let data: AuthorshipData = {
				totalBytes: 0,
				users: [],
			};
			let userdata: {
				[editor: string]: {
					name?: string;
					bytes: number;
					percent?: number;
				};
			} = {};

			for (let token of tokens) {
				data.totalBytes += token.str.length;
				let editor = token['editor'];
				if (!userdata[editor]) {
					userdata[editor] = { bytes: 0 };
				}
				userdata[editor].bytes += token.str.length;
				if (editor.startsWith('0|')) {
					// IP
					userdata[editor].name = editor.slice(2);
				}
			}

			Object.entries(userdata).map(([userid, { bytes }]) => {
				userdata[userid].percent = bytes / data.totalBytes;
				if (userdata[userid].percent < 0.02) {
					delete userdata[userid];
				}
			});

			await bot
				.request({
					action: 'query',
					list: 'users',
					ususerids: Object.keys(userdata).filter((us) => !us.startsWith('0|')), // don't lookup IPs
				})
				.then((json) => {
					json.query.users.forEach((us: any) => {
						userdata[us.userid].name = us.name;
					});
				});

			data.users = Object.entries(userdata)
				.map(([userid, { bytes, name, percent }]) => {
					return {
						id: Number(userid),
						name: name,
						bytes: bytes,
						percent: percent,
					};
				})
				.sort((a, b) => {
					return a.bytes < b.bytes ? 1 : -1;
				});

			return data;
		}

		/**** Post operations *****/
		// Defined in bot.js

		edit(transform: (rev: { content: string; timestamp: string }) => string | ApiEditPageParams) {
			return bot.edit(this.toString(), transform);
		}

		save(text: string, summary?: string, options?: ApiEditPageParams) {
			return bot.save(this.toString(), text, summary, options);
		}

		newSection(header: string, message: string, additionalParams?: ApiEditPageParams) {
			return bot.newSection(this.toString(), header, message, additionalParams);
		}

		move(target: string, summary: string, options?: ApiMoveParams) {
			return bot.move(this.toString(), target, summary, options);
		}

		delete(summary: string, options?: ApiDeleteParams) {
			return bot.delete(this.toString(), summary, options);
		}

		undelete(summary: string, options?: ApiUndeleteParams) {
			return bot.undelete(this.toString(), summary, options);
		}

		purge(options?: ApiPurgeParams) {
			return bot.purge(this.toString(), options);
		}
	}

	return Page as MwnPageStatic;
}

export interface PageViewOptions {
	access?: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web';
	agent?: 'all-agents' | 'user' | 'spider' | 'automated';
	granularity?: 'daily' | 'monthly';
	start?: Date;
	end?: Date;
}
export interface PageViewData {
	project: string;
	article: string;
	granularity: string;
	timestamp: string;
	access: string;
	agent: string;
	views: number;
}

export interface AuthorshipData {
	totalBytes: number;
	users: Array<{
		id: number;
		name: string;
		bytes: number;
		percent: number;
	}>;
}
