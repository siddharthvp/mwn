module.exports = function(bot) {

	class File extends bot.page {

		/**
		 * @constructor
		 * @param {string} name - name of the file
		 */
		constructor(name) {
			super(name, 6);
			if (this.namespace !== 6) {
				throw new Error('not a file');
			}
		}

		/**
		 * Get the name of the file without extension or namespace prefix.
		 *
		 * @return {string} File name without file extension, in the canonical form with
		 * underscores instead of spaces. For example, the title "File:Example_image.svg"
		 * will be returned as "Example_image".
		 */
		getName() {
			var ext = this.getExtension();
			if ( ext === null ) {
				return this.getMain();
			}
			return this.getMain().slice( 0, -ext.length - 1 );
		}

		/**
		 * Get the name of the file without extension or namespace prefix.
		 *
		 * @return {string} File name without file extension, formatted with spaces instead
		 * of underscores. For example, the title "File:Example_image.svg" will be returned
		 * as "Example image".
		 */
		getNameText () {
			return this.getName().replace( /_/g, ' ' );
		}


		/**
		 * Get file usages
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>} - resolved with array of { pageid: 32434,
		 * ns: 0, title: 'Main Page', redirect: false } like objects.
		 */
		usages(options) {
			return bot.request(Object.assign({
				"action": "query",
				"prop": "fileusage",
				"titles": this.toString(),
				"fuprop": "pageid|title|redirect"
			}, options)).then(data => {
				return data.query.pages[0].fileusage || [];
			});
		}

		// TODO: Add wrapper for prop=imageinfo

		download(localname) {
			return bot.download(this.toString(), localname);
		}

	}

	return File;

};