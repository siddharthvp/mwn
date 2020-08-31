module.exports = function (bot) {

	/**
	 * Class for some basic wikitext parsing, involving
	 * links, files, categories, templates and simple tables.
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
			this.unbinder = {
				counter: 0,
				history: {},
				prefix: '%UNIQ::' + Math.random() + '::',
				postfix: '::UNIQ%'
			};
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


		/**
		 * Temporarily hide a part of the string while processing the rest of it.
		 * 
	 	 * eg.  let u = new bot.wikitext("Hello world <!-- world --> world");
		 *      u.unbind('<!--','-->');
		 *      u.content = u.content.replace(/world/g, 'earth');
		 *      u.rebind(); // gives "Hello earth <!-- world --> earth"
		 *
		 * Text within the 'unbinded' part (in this case, the HTML comment) remains intact
		 * unbind() can be called multiple times to unbind multiple parts of the string.
		 *
		 * Attribution: https://en.wikipedia.org/wiki/MediaWiki:Gadget-morebits.js (cc-by-sa 3.0/GFDL)
		 * @param {string} prefix
		 * @param {string} postfix
		 */
		unbind(prefix, postfix) {
			let re = new RegExp(prefix + '([\\s\\S]*?)' + postfix, 'g');
			this.text = this.text.replace(re, match => {
				let current = this.unbinder.prefix + this.unbinder.counter + this.unbinder.postfix;
				this.unbinder.history[current] = match;
				++this.unbinder.counter;
				return current;
			});
		}
				
		/**
		 * Rebind after unbinding.
		 * @returns {string} The output 
		 */
		rebind() {
			let content = this.text;
			content.self = this;
			for (let [current, replacement] of Object.entries(this.unbinder.history)) {
				content = content.replace(current, replacement);
			}
			this.text = content;
			return this.text;
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
		 *  3. Further restrictions may apply.
		 *
		 * Tables generated via mwn.table() class are intended to be parsable.
		 * 
		 * This method throws when it finds an inconsistency (rather than silently
		 * cause undesired behaviour).
		 *
		 * @param {string} text
		 * @returns {Object[]} - each object in the returned array represents a row,
		 * with its keys being column names, and values the cell content
		 */
		static parseTable(text) {
			text = text.trim();
			const indexOfRawPipe = function (text) {

				// number of unclosed brackets
				let tlevel = 0, llevel = 0;
		
				let n = text.length;
				for (let i = 0; i < n; i++) {
			
					if (text[i] === '{' && text[i+1] === '{') {
						tlevel++;
						i++;
					} else if (text[i] === '[' && text[i+1] === '[') {
						llevel++;
						i++;
					} else if (text[i] === '}' && text[i+1] === '}') {
						tlevel--;
						i++;
					} else if (text[i] === ']' && text[i+1] === ']') {
						llevel--;
						i++;
					} else if (text[i] === '|' && tlevel === 0 && llevel === 0) {
						return i;
					}
				}
			};
			if (!text.startsWith('{|') || !text.endsWith('|}')) {
				throw new Error('failed to parse table. Unexpected starting or ending');
			}
			// remove front matter and final matter
			// including table attributes and caption, and unnecessary |- at the top
			text = text.replace(/^\{\|.*$((\n\|-)?\n\|\+.*$)?(\n\|-)?/m, '').replace(/^\|\}$/m, '');

			let [header, ...rows] = text.split(/^\|-/m).map(r => r.trim());

			// remove cell attributes, extracts data
			const extractData = (cell) => {
				return cell.slice(indexOfRawPipe(cell) + 1).trim();
			};

			// XXX: handle the case where there are is no header row
			let cols = header.split('\n').map(e => e.replace(/^!/, ''));

			if (cols.length === 1) { // non-multilined table?
				cols = cols[0].split('!!');
			}
			cols = cols.map(extractData);

			let numcols = cols.length;

			let output = new Array(rows.length);

			rows.forEach((row, idx) => {
				let cells = row.split(/^\|/m).slice(1);  // slice(1) removes the emptiness or the row styles if present

				if (cells.length === 1) { // non-multilined
					// cells are separated by ||
					cells = cells[0].replace(/^\|/, '').split('||');
				}

				cells = cells.map(extractData);

				if (cells.length !== numcols) {
					throw new Error(`failed to parse table: found ${cells.length} cells on row ${idx}, expected ${numcols}`);
				}

				output[idx] = {}; // output[idx] represents a row
				for (let i = 0; i < numcols; i++) {
					output[idx][cols[i]] = cells[i];
				}
			});

			return output;

		}


		/**
		 * Parse sections from wikitext
		 * @param {string} text 
		 * @returns {{level: number, header: string, index: number, content: string}[]} array of 
		 * section objects. Each section object has the level, header, index (of beginning) and content.
		 * Content *includes* the equal signs and the header.
		 * The top is represented as level 1, with header `null`.
		 */
		static parseSections(text) {
			const rgx = /^(=+)(.*?)\1/mg;
			let sections = [
				{
					level: 1,
					header: null,
					index: 0
				}
			];
			let match;
			while (match = rgx.exec(text)) { // eslint-disable-line no-cond-assign
				sections.push({
					level: match[1].length,
					header: match[2].trim(),
					index: match.index
				});
			}
			let n = sections.length;
			for (let i = 0; i < n - 1; i++) {
				sections[i].content = text.slice(sections[i].index, sections[i + 1].index);
			}
			sections[n - 1].content = text.slice(sections[n - 1].index);
			return sections;
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
