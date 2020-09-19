module.exports = function(bot) {

	class Page extends bot.title {

		constructor(arg) {
			if (arg instanceof bot.title) {
				super(arg.title, arg.namespace);
			} else {
				super(...arguments);
			}
			this.data = {};
		}

		/**
		 * @override
		 */
		getTalkPage() {
			return new Page(super.getTalkPage());
		}

		/**
		 * @override
		 */
		getSubjectPage() {
			return new Page(super.getSubjectPage());
		}

		/**** Get operations *****/

		/**
		 * Get page wikitext
		 * @returns {Promise<string>}
		 * */
		text() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "wikitext"
			}).then(data => {
				this.data.text = data.parse.wikitext;
				return data.parse.wikitext;
			});
		}

		/**
		 * Get page categories
		 * @returns {Promise<Object[]>} Resolved with array of objects like
		 * { sortkey: '...', category: '...', hidden: true }
		 */
		categories() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "categories"
			}).then(data => data.parse.categories);
		}

		/**
		 * Get templates transcluded on the page
		 * @returns {Promise<Object[]>} Resolved with array of objects like
		 * { ns: 10, title: 'Template:Cite web', exists: true }
		 */
		templates() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "templates"
			}).then(data => data.parse.templates);
		}

		/**
		 * Get links on the page
		 * @returns {Promise<Object[]>} Resolved with array of objects like
		 * { ns: 0, title: 'Main Page', exists: true }
		 */
		links() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "links"
			}).then(data => data.parse.links);
		}


		/**
		 * Get list of pages linking to this page
		 * @returns {Promise<String[]>}
		 */
		backlinks() {
			return bot.continuedQuery({
				"action": "query",
				"prop": "linkshere",
				"titles": this.toString(),
				"lhprop": "title",
				"lhlimit": "max"
			}).then(jsons => {
				var pages = jsons.reduce((pages, json) => pages.concat(json.query.pages), []);
				var page = pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return page.linkshere.map(pg => pg.title);
			});
		}

		/**
		 * Get list of pages transcluding this page
		 * @returns {Promise<String[]>}
		 */
		transclusions() { 
			return bot.continuedQuery({
				"action": "query",
				"prop": "transcludedin",
				"titles": this.toString(),
				"tiprop": "title",
				"tilimit": "max"
			}).then(jsons => {
				var pages = jsons.reduce((pages, json) => pages.concat(json.query.pages), []);
				var page = pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return page.transcludedin.map(pg => pg.title);
			});
		}


		/**
		 * Returns list of images on the page
		 * @returns {Promise<String[]>} - array elements don't include File: prefix
		 */
		images() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "images"
			}).then(data => data.parse.images);
		}

		/**
		 * Returns list of external links on the page
		 * @returns {Promise<String[]>}
		 */
		externallinks() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "externallinks"
			}).then(data => data.parse.externallinks);
		}

		/**
		 * Returns list of subpages of the page
		 * @returns {Promise<String[]>}
		 */
		subpages(options) {
			return bot.request(Object.assign({
				"action": "query",
				"list": "allpages",
				"apprefix": this.title + '/',
				"apnamespace": this.namespace,
				"aplimit": "max"
			}, options)).then((data) => {
				return data.query.allpages.map(pg => pg.title);
			});
		}

		/**
		 * Check if page is redirect or not
		 * @returns {Promise<boolean>}
		 */
		isRedirect() {
			return this.getRedirectTarget().then(target => {
				return this.toText() !== target;
			});
		}

		/**
		 * Get redirect target.
		 * Returns the same page name if the page is not a redirect.
		 * @returns {Promise<string>}
		 */
		getRedirectTarget() {
			if (this.data.text) {
				var target = /^\s*#redirect \[\[(.*?)\]\]/.exec(this.data.text);
				if (!target) {
					return this.toText();
				}
				return Promise.resolve(new bot.title(target[1]).toText());
			}
			return bot.request({
				action: 'query',
				titles: this.toString(),
				redirects: '1',
			}).then(data => {
				var page = data.query.pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return page.title;
			});
		}


		/**
		 * Get username of the page creator
		 * @returns {Promise<string>}
		 */
		getCreator() {
			return bot.request({
				action: 'query',
				titles: this.toString(),
				prop: 'revisions',
				rvprop: 'user',
				rvlimit: 1,
				rvdir: 'newer'
			}).then(data => {
				var page = data.query.pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return page.revisions[0].user;
			});
		}

		/**
		 * Get username of the last deleting admin (or null)
		 * @returns {Promise<string>}
		 */
		getDeletingAdmin() {
			return bot.request({
				action: "query",
				list: "logevents",
				leaction: "delete/delete",
				letitle: this.toString(),
				lelimit: 1
			}).then(data => {
				var logs = data.query.logevents;
				if (logs.length === 0) {
					return null;
				}
				return logs[0].user;
			});
		}

		/**
		 * Get short description, either the local one (for English Wikipedia)
		 * or the one from wikidata.
		 * @param {Object} customOptions 
		 */
		getDescription(customOptions) {
			return bot.request({
				action: 'query',
				prop: 'description',
				titles: this.toString(),
				...customOptions
			}).then(data => {
				var page = data.query.pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return data.query.pages[0].description;
			});
		}

		/**
		 * Get the edit history of the page
		 * @param {revisionprop[]} props - revision properties to fetch, by default content is
		 * excluded
		 * @param {number} [limit=50] - number of revisions to fetch data about
		 * @param {Object} customOptions - custom API options
		 * @returns {Promise<Object[]>} - resolved with array of objects representing
		 * revisions, eg. { revid: 951809097, parentid: 951809097, timestamp:
		 * "2020-04-19T00:45:35Z", comment: "Edit summary" }
		 */
		history(props, limit, customOptions) {
			return bot.request(Object.assign({
				"action": "query",
				"prop": "revisions",
				"titles": this.toString(),
				"rvprop": props || "ids|timestamp|flags|comment|user",
				"rvlimit": limit || 50
			}, customOptions)).then(data => {
				var page = data.query.pages[0];
				if (page.missing) {
					let error = new Error('missingarticle');
					error.code = 'missingarticle';
					return Promise.reject(error);
				}
				return data.query.pages[0].revisions;
			});
		}

		/**
		 * Get the page logs.
		 * @param {logprop[]} props - data about log entries to fetch
		 * @param {number} limit - max number of log entries to fetch
		 * @param {string} type - type of log to fetch, can either be an letype or leaction
		 * Leave undefined (or null) to fetch all log types
		 * @param {Object} customOptions
		 * @returns {Promise<Object[]>} - resolved with array of objects representing
		 * log entries, eg. { ns: '0', title: 'Main Page', type: 'delete', user: 'Example',
		 * action: 'revision', timestamp: '2020-05-05T17:13:34Z', comment: 'edit summary' }
		 */
		logs(props, limit, type, customOptions) {
			var logtypeObj = {};
			if (type) {
				if (type.includes('/')) {
					logtypeObj.leaction = type;
				} else {
					logtypeObj.letype = type;
				}
			}
			return bot.request(Object.assign({
				"action": "query",
				"list": "logevents",
				"leprop": props || "title|type|user|timestamp|comment",
				"letitle": this.toString(),
				"lelimit": limit || 50
			}, logtypeObj, customOptions)).then(data => {
				return data.query.logevents;
			});
		}



		/**** Post operations *****/
		// Defined in bot.js

		edit(transform) {
			return bot.edit(this.toString(), transform);
		}

		save(text, summary, options) {
			return bot.save(this.toString(), text, summary, options);
		}

		newSection(header, message, additionalParams) {
			return bot.newSection(this.toString(), header, message, additionalParams);
		}

		move(target, summary, options) {
			return bot.move(this.toString(), target, summary, options);
		}

		delete(summary, options) {
			return bot.delete(this.toString(), summary, options);
		}

		undelete(summary, options) {
			return bot.undelete(this.toString(), summary, options);
		}

		purge(options) {
			return bot.purge(this.toString(), options);
		}


	}

	return Page;

};

// Type definitions for JSDocs

/**
 * @typedef {"content" | "timestamp" | "user" | "comment" | "parsedcomment" | "ids" | "flags" |
 * "size"  | "tags" | "userid" | "contentmodel"} revisionprop
 */


/**
 * @typedef {"type" | "user" | "comment" | "details" | "timestamp" | "title" | "parsedcomment" |
 * "ids" | "tags" | "userid"} logprop
 */
