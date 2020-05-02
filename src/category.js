module.exports = function(bot) {

	class Category extends bot.page {

		/**
		 * @constructor
		 * @param {string} name - name of the category
		 */
		constructor(name) {
			super(name, 14);
			if (this.namespace !== 14) {
				throw new Error('not a category page');
			}
		}

		// TODO: Add recursive modes

		/**
		 * Get all members in the category - this includes subcategories, pages and files
		 * @returns {Promise<Object[]>} - Resolved with array of objects of form
		 * { pageid: 324234, ns: 0, title: 'Main Page' }
		 */
		members() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
			}).then(data => data.query.categorymembers);
		}

		/**
		 * Get all pages in the category - does not include subcategories or files
		 * @returns {Promise<Object[]>} - Resolved with array of objects of form
		 * { pageid: 324234, ns: 0, title: 'Main Page' }
		 */
		pages() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
				"cmtype": "page"
			}).then(data => data.query.categorymembers);
		}

		/**
		 * Get all subcategories of the category
		 * @returns {Promise<Object[]>} - Resolved with array of objects of form
		 * { pageid: 324234, ns: 14, title: 'Category:Living people' }
		 */
		subcats() {
			return bot.request({
				"action": "query",
				"list": "categorymembers",
				"cmtitle": "Category:" + this.title,
				"cmtype": "subcat"
			}).then(data => data.query.categorymembers);
		}

		/**
		 * Get all files in the category
		 * @returns {Promise<Object[]>} - Resolved with array of objects of form
		 * { pageid: 324234, ns: 6, title: 'File:Image.jpg' }
		 */
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