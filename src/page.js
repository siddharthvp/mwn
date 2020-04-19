module.exports = function(bot) {

	// XXX: TO BE COMPLETED:
	return class Page extends bot.title {

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

		wikitext_links() {

		}
		wikitext_templates() {

		}

	};

};
