module.exports = function(bot) {

	class Page extends bot.title {

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
			}).then(data => data.parse.wikitext);
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


		// backlinks() {
		// XXX: FIX UP continuedQuery first
		// return bot.continuedQuery({
		// 	"action": "query",
		// 	"prop": "linkshere",
		// 	"titles": this.toString(),
		// 	"lhprop": "title",
		// 	"lhlimit": "max"
		// }).then(data => data.query.pages[0].linkshere.map(pg => pg.title));
		//}


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
			return this.request(Object.assign({
				"action": "query",
				"list": "allpages",
				"apprefix": this.title + '/',
				"apnamespace": this.namespace,
				"aplimit": "max"
			}, options)).then((data) => {
				return data.query.allpages.map(pg => pg.title);
			});
		}



		/**** Post operations *****/
		// Defined in bot.js

		edit(transform) {
			return bot.edit(this.toString(), transform);
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
