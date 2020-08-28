module.exports = function (bot) {

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
			for (let i = 0; i < n; i++) {
				if (this.text[i] === '[' && this.text[i + 1] === '[') {
					stack.push({ startIdx: i });
					i++;
				} else if (this.text[i] === ']' && this.text[i + 1] === ']' && stack.top()) {
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
		 * @param {string} wikitext
		 * @param {{recursive: boolean, namePredicate: function, templatePredicate: function,
		 * count: number}} config
		 * @config {boolean} recursive - also parse templates within subtemplates
		 * @config {function} namePredicate - include template in result only if the its name matches this predicate
		 * More efficient than templatePredicate as the template parameters aren't parsed if name didn't match.
		 * @config {function} templatePredicate - include template in result only if it matches this predicate
		 * @config {number} count - max number of templates to be parsed. If recursive is set true, note that
		 * templates are parsed breadth-first, not depth-first.
		 * @returns {Template[]}
		 */
		parseTemplates(config) {
			return this.templates = parseTemplates(this.text, config);
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
		 *  1. It doesn't have any merged or joined cells.
		 *  2. It doesn't use any templates to produce any table markup.
		 *  3. Styles applied on cells or rows may be parsed as content.
		 *  4. Further restrictions may apply.
		 *
		 * Tables generated via mwn.table() class are intended to be parsable.
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
			// remove front matter and final matter
			// including table attributes and caption, and unnecessary |- at the beginning
			text = text.replace(/^\{\|.*$((\n\|-)?\n\|\+.*$)?(\n\|-)?/m, '').replace(/^\|\}$/m, '');

			var rows = text.split(/^\|-/m).map(r => r.trim());

			var header = rows[0];
			rows = rows.slice(1);

			var cols = header.split('\n');

			if (cols.length === 1) { // non-multilined table?
				cols = cols[0].replace(/^! /, '').split('!!');
				cols = cols.map(h => {
					if (h.includes(' | ')) {
						return h.slice(h.lastIndexOf(' | ') + 3).trim();
					} else {
						return h.trim();
					}
				});

			} else {

				cols = cols.map(h => {
					if (h.includes(' | ')) {
						return h.slice(h.lastIndexOf(' | ') + 3).trim();
					} else {
						return h.slice(h.lastIndexOf('! ') + 2).trim();
					}
				});
			}

			var numcols = cols.length;

			var output = new Array(rows.length);

			rows.forEach((row, idx) => {
				let cells = row.split(/^\|/m).slice(1);  // slice(1) removes the empty

				if (cells.length === 1) { // non-multilined
					// cells are separated by ||, through we use a regex to split to
					// handle the case when the last cell is blank (there is no space after ||)
					cells = cells[0].replace(/^\| /, '').split(/ \|\|(?: |$)/).map(e => e.trim());
				} else {
					cells = cells.map(e => e.trim());
				}

				if (cells.length !== numcols) {
					throw new Error(`failed to parse table: found ${cells.length} cells on row ${idx}, expected ${numcols}`);
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
	var processLink = function (self, startIdx, endIdx) {
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
		if (target[0] !== ':') {
			if (title.namespace === 6) {
				self.files.push({
					wikitext: linktext,
					target: title,
					props: linktext.slice(linktext.indexOf('|') + 1, -2)
				});
				return;
			} else if (title.namespace === 14) {
				self.categories.push({
					wikitext: linktext,
					target: title,
					sortkey: noSortkey ? '' : displaytext
				});
				return;
			}
		}
		self.links.push({
			wikitext: linktext,
			target: title,
			displaytext: displaytext
		});
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
		constructor(wikitext) {
			this.wikitext = wikitext;
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
			return this.parameters.find(p => {
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

	// parseTemplates() and processTemplateText() are adapted from
	// https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js written by Evad37
	// which was in turn adapted from https://en.wikipedia.org/wiki/User:SD0001/parseAllTemplates.js
	// written by me. (cc-by-sa/GFDL)

	/**
	 * @inheritdoc
	 */
	const parseTemplates = function (wikitext, config) {
		config = config || {
			recursive: false,
			namePredicate: null,
			templatePredicate: null,
			count: null
		};

		const result = [];

		const n = wikitext.length;

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
						var processed = processTemplateText(templateWikitext, config.namePredicate, config.templatePredicate);
						if (processed) {
							result.push(processed);
						}
						if (config.count && result.length === config.count) {
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

		if (config.recursive) {
			var subtemplates = result.map(template => {
				return template.wikitext.slice(2, -2);
			}).filter(templateWikitext => {
				return /\{\{.*\}\}/s.test(templateWikitext);
			}).map(templateWikitext => {
				return parseTemplates(templateWikitext, config);
			});
			return result.concat.apply(result, subtemplates);
		}

		return result;

	};

	/**
	 * @param {string} text - template wikitext without braces, with the pipes in
	 * nested templates replaced by \x01
	 * @returns {Template}
	 */
	const processTemplateText = function (text, namePredicate, templatePredicate) {

		const template = new Template('{{' + text.replace(/\1/g, '|') + '}}');

		// swap out pipe in links with \1 control character
		// [[File: ]] can have multiple pipes, so might need multiple passes
		while (/(\[\[[^\]]*?)\|(.*?\]\])/g.test(text)) {
			text = text.replace(/(\[\[[^\]]*?)\|(.*?\]\])/g, '$1\1$2');
		}

		const [name, ...parameterChunks] = text.split('|').map(chunk => {
			// change '\1' control characters back to pipes
			return chunk.replace(/\1/g, '|');
		});

		template.setName(name);
		
		if (namePredicate && !namePredicate(template.name)) {
			return null;
		}

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

		if (templatePredicate && !templatePredicate(template)) {
			return null;
		}

		return template;
	};

	const strReplaceAt = function (string, index, char) {
		return string.slice(0, index) + char + string.slice(index + 1);
	};

	return Wikitext;

};
