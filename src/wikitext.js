module.exports = function(bot) {

	/**
	 * Class for some basic wikitext parsing, involving
	 * links, files, categories and templates.
	 *
	 * For more advanced and sophisticated wikitext parsing, use
	 * mwparserfromhell <https://github.com/earwig/mwparserfromhell>
	 * implemented in python (which you can use within node.js using
	 * the child_process interface). However, mwparserfromhell doesn't
	 * recognize localised namespaces and wiki-specific configs.
	 *
	 * This class is for methods for parsing wikitext, for the
	 * static methods for creating wikitext, see static_utils.js.
	 */
	class Wikitext {

		/** @param {string} wikitext */
		constructor(wikitext) {
			if (typeof wikitext !== 'string') {
				throw new Error('non-string constructor for wikitext class');
			}
			this.text = wikitext;
		}

		/** Parse links, file usages and categories from the wikitext */
		parseLinks() {
			this.links = [];
			this.files = [];
			this.categories = [];

			var n = this.text.length;
			// files can have links in captions; use a stack to handle the nesting
			var stack = new Stack();
			for (let i=0; i<n; i++) {
				if (this.text[i] === '[' && this.text[i+1] === '[') {
					stack.push({startIdx: i });
					i++;
				} else if (this.text[i] === ']' && this.text[i+1] === ']' && stack.top()) {
					stack.top().endIdx = i + 1;
					processLink(this, stack.top().startIdx, stack.top().endIdx);
					stack.pop();
					i++; // necessary to handle cases like [[File:ImageName|thumb|A [[hill]]]]
				}
			}
		}

		/**
		 * Parses templates from wikitext.
	 	 * Returns an array of Template objects
		 * var templates = parseTemplates("Hello {{foo |Bar|baz=qux |2=loremipsum|3=}} world");
		 *  console.log(templates[0]); // gives:
			{
				name: "foo",
				wikitext:"{{foo |Bar|baz=qux | 2 = loremipsum  |3=}}",
				parameters: [ { name: 1, value: 'Bar', wikitext: '|Bar' },
					{ name: 'baz', value: 'qux', wikitext: '|baz=qux ' },
					{ name: '2', value: 'loremipsum', wikitext: '| 2 = loremipsum  ' },
					{ name: '3', value: '', wikitext: '|3=' }
				]
			}
		 * @param {number} [count] - maximum number of templates to parse (default infinite)
	     * @return Template[]
		 */
		parseTemplates(count) {
			return this.templates = parseTemplates(this.text, false, count);
		}

		/**
		 * Also parse templates that occur within other templates, rather than just top-level templates.
		 * @param {number} [depth=true] - specify a number to limit recursive parsing to a the given recursion
		 * depth. For infinite depth, specify `true` (default). Eg. with recursive=1, all templates and
		 * sub-templates will be parsed, but not the templates within the sub-templates
		 */
		parseTemplatesRecursive(depth) {
			return this.templates = parseTemplates(this.text, depth || true);
		}

		/**
		 * Remove a template, link, file or category from the text
		 * CAUTION: If an entity with the very same wikitext exists earlier in the text,
		 * that one will be removed instead.
		 * @param {Object|Template} entity - anything with a wikitext attribute
		 * and end index
		 */
		removeEntity(entity) {
			this.text = this.text.replace(entity.wikitext, '');
		}

		/** Get the updated text  @returns {string} */
		getText() {
			return this.text;
		}

		/**
		 * Parse the text using the API.
		 * @see https://www.mediawiki.org/wiki/API:Parsing_wikitext
		 * @param {Object} [options] - additional API options
		 * @returns {Promise}
		 */
		apiParse(options) {
			return bot.parseWikitext(this.text, options);
		}


		/**
		 * Simple table parser.
		 * Parses tables provided:
		 *  1. It doesn't have any merged or joined rows.
		 *  2. It doesn't use any templates to produce any table markup.
		 *  3. It uses multilining, i.e. each cell is on a new line beginning with |, rather
		 *     than multiple cells of a row being on same line separated by ||
		 *  4. Further restrictions may apply.
		 *
		 * @param {string} text
		 * @returns {Object[]} - each object in the returned array represents a row,
		 * with its keys being column names, and values the cell content
		 */
		static parseTable(text) {
			text = text.trim();
			if (!text.startsWith('{|') || !text.endsWith('|}')) {
				throw new Error('failed to parse table. Unexpected starting or ending');
			}
			text = text.replace(/^\{\|.*$(\n\|-)?/m, '').replace(/^\|\}$/m, '');
			var rows = text.split(/^\|-/m).map(r => r.trim());

			var header = rows[0];
			rows = rows.slice(1);

			var cols = header.split('\n').map(h => {
				if (h.includes(' | ')) {
					return h.slice(h.lastIndexOf(' | ') + 3).trim();
				} else {
					return h.slice(h.lastIndexOf('! ') + 2).trim();
				}
			});

			var numcols = cols.length;

			var output = new Array(rows.length);

			rows.forEach((row, idx) => {
				let cells = row.split(/^\| /m).slice(1).map(e => e.trim());
				if (cells.length !== numcols) {
					throw new Error(`failed to parse table: found ${cells.length} on row ${idx}, expected ${numcols}`);
				}
				let outputrow = {};
				for (let i = 0; i < numcols; i++) {
					outputrow[cols[i]] = cells[i];
				}
				output[idx] = outputrow;
			});

			return output;

		}

	}

	/**** Private members *****/

	class Stack extends Array {
		top() {
			return this[this.length - 1];
		}
	}

	var processLink = function(self, startIdx, endIdx) {
		var linktext = self.text.slice(startIdx, endIdx + 1);
		var [target, displaytext] = linktext.slice(2, -2).split('|');
		var noSortkey = false;
		if (!displaytext) {
			displaytext = target[0] === ':' ? target.slice(1) : target;
			noSortkey = true;
		}
		var title = bot.title.newFromText(target);
		if (!title) {
			return;
		}
		var linkobj = {
			wikitext: linktext,
			dsr: [startIdx, endIdx]
			// Note: data source ranges (dsr) are invalidated by any removeEntity() operation,
			// or any direct modification to this.text
		};
		if (target[0] !== ':') {
			if (title.namespace === 6) {
				self.files.push(Object.assign({
					target: title,
					props: linktext.slice(linktext.indexOf('|') + 1, -2)
				}, linkobj));
				return;
			} else if (title.namespace === 14) {
				self.categories.push(Object.assign({
					target: title,
					sortkey: noSortkey ? '' : displaytext
				}, linkobj));
				return;
			}
		}
		self.links.push(Object.assign({
			target: title,
			displaytext: displaytext
		}, linkobj));
	};

	// Adapted from https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js
	// by Evad37 (cc-by-sa-3.0/GFDL)
	/**
	 * @class
	 * Represents the wikitext of template transclusion. Used by #parseTemplates.
	 * @prop {string} name Name of the template
	 * @prop {string} wikitext Full wikitext of the transclusion
	 * @prop {Object[]} parameters Parameters used in the translcusion, in order, of form:
		{
			name: {string|number} parameter name, or position for unnamed parameters,
			value: {string} Wikitext passed to the parameter (whitespace trimmed),
			wikitext: {string} Full wikitext (including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace)
		}
	*/
	class Template {

		/**
		 * @param {String} wikitext Wikitext of a template transclusion,
		 * starting with '{{' and ending with '}}'.
		 */
		constructor(wikitext, dsr) {
			this.wikitext = wikitext;
			// dsr stands for data source range, gives the starting and ending index in wikitext
			this.dsr = dsr, // an array of two numbers
			this.parameters = [];
		}
		addParam(name, val, wikitext) {
			this.parameters.push({
				'name': name,
				'value': val,
				'wikitext': '|' + wikitext
			});
		}
		getParam(paramName) {
			return this.parameters.find(function (p) {
				return p.name == paramName;
			});
		}
		getValue(paramName) {
			var param = this.getParam(paramName);
			return param ? param.value : null;
		}
		setName(name) {
			this.name = name.trim();
			this.nameTitle = bot.title.newFromText(name, 10);
		}
	}

	// Copied from https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js
	// adapted by Evad37 from the original by written by me at
	// https://en.wikipedia.org/wiki/User:SD0001/parseAllTemplates.js (cc-by-sa-3.0/GFDL)
	/**
	 *
	 * @param {string} wikitext
	 * @param {boolean|number} [recursive=false] - also parse templates within templates,
	 * give a number to specify recursion depth. If given as `true`, infinite recursion
	 * depth is assumed.
	 * @param {number} [count] - stop parsing when this many templates have been found,
	 * Recursive parsing does NOT work if count is specified.
	 */
	var parseTemplates = function (wikitext, recursive, count) {

		var result = [];

		var n = wikitext.length;

		// number of unclosed braces
		var numUnclosed = 0;

		// are we inside a comment, or between nowiki tags, or in a {{{parameter}}}?
		var inComment = false;
		var inNowiki = false;
		var inParameter = false;

		var startIdx, endIdx;

		for (var i = 0; i < n; i++) {

			if (!inComment && !inNowiki && !inParameter) {

				if (wikitext[i] === '{' && wikitext[i + 1] === '{' && wikitext[i + 2] === '{' && wikitext[i + 3] !== '{') {
					inParameter = true;
					i += 2;
				} else if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
					if (numUnclosed === 0) {
						startIdx = i + 2;
					}
					numUnclosed += 2;
					i++;
				} else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
					if (numUnclosed === 2) {
						endIdx = i;
						var templateWikitext = wikitext.slice(startIdx, endIdx); // without braces
						result.push(processTemplateText(templateWikitext, [startIdx - 2, endIdx + 1]));
						if (count && result.length === count) {
							return result;
						}
					}
					numUnclosed -= 2;
					i++;
				} else if (wikitext[i] === '|' && numUnclosed > 2) {
					// swap out pipes in nested templates with \1 character
					wikitext = strReplaceAt(wikitext, i, '\1');
				} else if (/^<!--/.test(wikitext.slice(i, i + 4))) {
					inComment = true;
					i += 3;
				} else if (/^<nowiki ?>/.test(wikitext.slice(i, i + 9))) {
					inNowiki = true;
					i += 7;
				}

			} else { // we are in a comment or nowiki or {{{parameter}}}
				if (wikitext[i] === '|') {
					// swap out pipes with \1 character
					wikitext = strReplaceAt(wikitext, i, '\1');
				} else if (/^-->/.test(wikitext.slice(i, i + 3))) {
					inComment = false;
					i += 2;
				} else if (/^<\/nowiki ?>/.test(wikitext.slice(i, i + 10))) {
					inNowiki = false;
					i += 8;
				} else if (wikitext[i] === '}' && wikitext[i + 1] === '}' && wikitext[i + 2] === '}') {
					inParameter = false;
					i += 2;
				}
			}

		}

		if (recursive && !count) {
			var subtemplates = result.map(function (template) {
				return template.wikitext.slice(2, -2);
			}).filter(function (templateWikitext) {
				return /\{\{(?:.|\n)*\}\}/.test(templateWikitext);
			}).map(function (templateWikitext) {
				return parseTemplates(templateWikitext, recursive === true ? true : recursive - 1);
			});

			return result.concat.apply(result, subtemplates);
		}

		return result;

	};

	/**
	 * @param {string} text - template wikitext without braces, with the pipes in
	 * nested templates replaced by \1
	 * @param {Number[]} [dsr] - data source range (optional) for the template object
	 * Array of starting and ending indices of template in wikitext
	 */
	var processTemplateText = function (text, dsr) {

		var template = new Template('{{' + text.replace(/\1/g, '|') + '}}', dsr);

		// swap out pipe in links with \1 control character
		// [[File: ]] can have multiple pipes, so might need multiple passes
		while (/(\[\[[^\]]*?)\|(.*?\]\])/g.test(text)) {
			text = text.replace(/(\[\[[^\]]*?)\|(.*?\]\])/g, '$1\1$2');
		}

		var chunks = text.split('|').map(function (chunk) {
			// change '\1' control characters back to pipes
			return chunk.replace(/\1/g, '|');
		});

		template.setName(chunks[0]);

		var parameterChunks = chunks.slice(1);

		var unnamedIdx = 1;
		parameterChunks.forEach(function (chunk) {
			var indexOfEqualTo = chunk.indexOf('=');
			var indexOfOpenBraces = chunk.indexOf('{{');

			var isWithoutEquals = !chunk.includes('=');
			var hasBracesBeforeEquals = chunk.includes('{{') && indexOfOpenBraces < indexOfEqualTo;
			var isUnnamedParam = (isWithoutEquals || hasBracesBeforeEquals);

			var pName, pNum, pVal;
			if (isUnnamedParam) {
				// Get the next number not already used by either an unnamed parameter,
				// or by a named parameter like `|1=val`
				while (template.getParam(unnamedIdx)) {
					unnamedIdx++;
				}
				pNum = unnamedIdx;
				pVal = chunk.trim();
			} else {
				pName = chunk.slice(0, indexOfEqualTo).trim();
				pVal = chunk.slice(indexOfEqualTo + 1).trim();
			}
			template.addParam(pName || pNum, pVal, chunk);
		});

		return template;
	};

	var strReplaceAt = function (string, index, char) {
		return string.slice(0, index) + char + string.slice(index + 1);
	};

	return Wikitext;

};

