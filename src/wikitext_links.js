var wikitext_links = function(bot) {

	return class {

		constructor(wiktext) {
			this.text = wiktext;
		}

		parse() {
			this.links = [];
			this.files = [];
			this.categories = [];

			var n = this.text.length;
			var startIdx, endIdx;
			for (let i=0; i<n; i++) {
				if (this.text[i] === '[' && this.text[i+1] === '[') {
					startIdx = i + 2;
				} else if (this.text[i] === ']' && this.text[i+1] === ']') {
					endIdx = i;
					this._processLink(startIdx, endIdx);
					startIdx = null;
				}
			}
		}

		_processLink(startIdx, endIdx) {
			var linktext = this.text.slice(startIdx, endIdx);
			var [target, displaytext] = linktext.split('|');
			var noSortkey = false;
			if (!displaytext) {
				displaytext = target[0] === ':' ? target.slice(1) : target;
				noSortkey = true;
			}
			var title = bot.title.newFromText(target);
			if (!title) {
				return;
			}
			if (target[0] !== ':') {
				if (title.namespace === 6) {
					this.files.push({target: title, props: linktext.slice(linktext.indexOf('|') + 1)});
					return;
				} else if (title.namespace === 14) {
					this.categories.push({
						target: title,
						sortkey: noSortkey ? '' : displaytext
					});
					return;
				}
			}
			this.links.push({target: title, displaytext: displaytext});
		}

	};

};


module.exports = wikitext_links;