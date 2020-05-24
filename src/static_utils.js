module.exports = {

	/**
	 * Get wikitext for a new link
	 * @param {string|bot.title} target
	 * @param {string} [displaytext]
	 */
	link: function(target, displaytext) {
		if (typeof target.toText === 'function') {
			return '[[' + target.toText() +
				(target.fragment ? '#' + target.fragment : '') +
				(displaytext ? '|' + displaytext : '') +
				']]';
		}
		return '[[' + target + (displaytext ? '|' + displaytext : '') + ']]';
	},

	/**
	 * Get wikitext for a template usage
	 * @param {string|bot.title} title
	 * @param {Object} [parameters] - template parameters as object
	 */
	template: function(title, parameters) {
		if (typeof title.toText === 'function') {
			if (title.namespace === 10) {
				title = title.getMainText(); // skip namespace name for templates
			} else if (title.namespace === 0) {
				title = ':' + title.toText(); // prefix colon for mainspace
			} else {
				title = title.toText();
			}
		}
		return '{{' + title +
			Object.entries(parameters).map(([key, val]) => {
				return '|' + key + '=' + val;
			}).join('') +
			'}}';
	},
	
	table: class table {
		/**
		 * @param {Object} config 
		 * @config {boolean} plain - plain table without borders
		 * @config {boolean} sortable - make columns sortable
		 * @config {boolean} multiline - put each cell of the table on a new line,
		 * this causes no visual changes, but the wikitext representation is different.
		 */
		constructor(config) {
			var classes = [];
			if (config) {
				if (!config.plain) {
					classes.push('wikitable');
				}
				if (config.sortable) {
					classes.push('sortable');
				}
				if (config.multiline) {
					this.multiline = true;
				}
			} else {
				classes.push('wikitable');
			}
			this.text = `{| ${classes.length ? `class="${classes.join(' ')}"` : ''}\n`;
		}
		/**
		 * Add the headers
		 * @param {string[]} headers - array of header items
		 */
		addHeaders(headers) {
			this.text += `|-\n`; // row separator
			if (this.multiline) {
				this.text += headers.map(e => `! ${e} \n`);
			} else {
				this.text += `! ` + headers.join(' !! ') + '\n';
			}
		}
		/**
		 * Add a row to the table
		 * @param {string[]} fields - array of items on the row,
		 */
		addRow(fields) {
			this.text += `|-\n`; // row separator
			if (this.multiline) {
				this.text += fields.map(e => `| ${e} \n`);
			} else {
				this.text += `| ` + fields.join(' || ') + '\n';
			}
		}
		/** @returns {string} the final table wikitext */
		getText() {
			return this.text + `|}`; // add the table closing tag and return
		}
	}

};
