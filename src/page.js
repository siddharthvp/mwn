module.exports = function(bot) {

	class Page extends bot.title {

		/**** Get operations *****/

		text() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "wikitext"
			}).then(data => data.parse.wikitext);
		}
		categories() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "categories"
			}).then(data => data.parse.categories);
		}
		templates() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "templates"
			}).then(data => data.parse.templates);
		}
		links() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "links"
			}).then(data => data.parse.links);
		}
		backlinks() {
			// XXX: FIX UP continuedQuery first
			// return bot.continuedQuery({
			// 	"action": "query",
			// 	"prop": "linkshere",
			// 	"titles": this.toString(),
			// 	"lhprop": "title",
			// 	"lhlimit": "max"
			// }).then(data => data.query.pages[0].linkshere.map(pg => pg.title));
		}
		images() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "images"
			}).then(data => data.parse.images);
		}
		externallinks() {
			return bot.request({
				"action": "parse",
				"page": this.toString(),
				"prop": "externallinks"
			}).then(data => data.parse.externallinks);
		}

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
