module.exports = function(bot) {

	class Wikitext {

		constructor(wikitext) {
			this.text = wikitext;
		}

		/** Parse links, file usages and categories from the wikitext */
		parse_links() {
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
					processLink(this, this.text.slice(startIdx, endIdx));
					startIdx = null;
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
		 * @param {Boolean} recursive Set to `true` to also parse templates that occur
		 * within other templates, rather than just top-level templates.
	     * @return Template[]
		 */
		parse_templates(recursive) {
			return this.templates = parseTemplates(this.text, recursive);
		}

	}

	var processLink = function(self, linktext) {
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
				self.files.push({
					target: title,
					props: linktext.slice(linktext.indexOf('|') + 1)
				});
				return;
			} else if (title.namespace === 14) {
				self.categories.push({
					target: title,
					sortkey: noSortkey ? '' : displaytext
				});
				return;
			}
		}
		self.links.push({target: title, displaytext: displaytext});
	};

	/**
	 * @class
	 * Represents the wikitext of template transclusion. Used by #parseTemplates.
	 * @prop {String} name Name of the template
	 * @prop {String} wikitext Full wikitext of the transclusion
	 * @prop {Object[]} parameters Parameters used in the translcusion, in order, of form:
		{
			name: {String|Number} parameter name, or position for unnamed parameters,
			value: {String} Wikitext passed to the parameter (whitespace trimmed),
			wikitext: {String} Full wikitext (including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace)
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
			return this.parameters.find(function (p) {
				return p.name == paramName;
			});
		}
		setName(name) {
			this.name = name.trim();
			// this.nameTitle = bot.title.newFromText(name);
			// if (this.nameTitle.namespace === 0 && name.trim()[0] !== ':') {
			// 	this.nameTitle.namespace = 10;
			// }
		}
	}

	var parseTemplates = function (wikitext, recursive) {

		var strReplaceAt = function (string, index, char) {
			return string.slice(0, index) + char + string.slice(index + 1);
		};

		var result = [];

		var processTemplateText = function (startIdx, endIdx) {
			var text = wikitext.slice(startIdx, endIdx);

			var template = new Template('{{' + text.replace(/\1/g, '|') + '}}');

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

			result.push(template);
		};


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
						processTemplateText(startIdx, endIdx);
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

		if (recursive) {
			var subtemplates = result.map(function (template) {
				return template.wikitext.slice(2, -2);
			}).filter(function (templateWikitext) {
				return /\{\{(?:.|\n)*\}\}/.test(templateWikitext);
			}).map(function (templateWikitext) {
				return parseTemplates(templateWikitext, true);
			});

			return result.concat.apply(result, subtemplates);
		}

		return result;

	};

	return Wikitext;

};

