module.exports = function(bot) {

	class Category extends bot.page {

		constructor(name) {
			super(name, 14);
			if (this.namespace !== 14) {
				throw new Error('not a category page');
			}
		}

		members() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
			}).then(data => data.query.categorymembers);
		}

		pages() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
				"cmtype": "page"
			}).then(data => data.query.categorymembers);
		}

		subcats() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
				"cmtype": "subcat"
			}).then(data => data.query.categorymembers);
		}

		files() {
			return bot.request({
				"action": "query",
				"format": "json",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
				"cmtype": "file"
			}).then(data => data.query.categorymembers);
		}

	}

	return Category;
};