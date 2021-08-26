/**
 * Configuration for parsing templates.
 */
export interface TemplateConfig {
	/**
	 * Also parse templates within subtemplates. The other config parameters
	 * (namePredicate, templatePredicate, count) are *not* compatible
	 * with recursive mode. Expect unexpected results if used.
	 */
	recursive?: boolean;
	/**
	 * Include template in result only if the its name matches this predicate.
	 * More efficient than templatePredicate as the template parameters
	 * aren't parsed if name didn't match.
	 */
	namePredicate?: (name: string) => boolean;
	/**
	 * Include template in result only if it matches this predicate
	 */
	templatePredicate?: (template: Template) => boolean;
	/**
	 * Max number of templates to be parsed
	 */
	count?: number;
}

// Adapted from https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js
// by Evad37 (cc-by-sa-3.0/GFDL)
// TODO: expand from evad37/xfdcloser
/**
 * Represents the wikitext of template transclusion. Used by {@link parseTemplates}.
 */
export class Template {
	/**
	 * Full wikitext of the transclusion
	 */
	wikitext: string;
	/**
	 * Parameters used in the transclusion
	 */
	parameters: Array<Parameter>;
	/**
	 * Name of the template
	 */
	name: string | number;

	// Spacing around pipes, equals signs, end braces (defaults)
	pipeStyle = ' |';
	equalsStyle = '=';
	endBracesStyle = '}}';

	/**
	 * @param {String} wikitext Wikitext of a template transclusion,
	 * starting with '{{' and ending with '}}'.
	 */
	constructor(wikitext: string) {
		this.wikitext = wikitext;
		this.parameters = [];
	}

	addParam(name: string | number, val: string, wikitext: string) {
		this.parameters.push(new Parameter(name, val, wikitext));
	}

	getParam(paramName: string | number): Parameter {
		return this.parameters.find((p) => {
			return p.name == paramName; // == is intentional
		});
	}

	getValue(paramName: string | number): string | null {
		let param = this.getParam(paramName);
		return param ? param.value : null;
	}

	setName(name: string) {
		name = name.trim();
		this.name = name[0] ? name[0].toUpperCase() + name.slice(1) : name;
	}
}

/**
 * Represents a template parameter
 */
export class Parameter {
	/**
	 * parameter name, or position for unnamed parameters
	 */
	name: string | number;
	/**
	 * Wikitext passed to the parameter (whitespace trimmed)
	 */
	value: string;
	/**
	 * Full wikitext (including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace)
	 */
	wikitext: string;

	constructor(name: string | number, val: string, wikitext: string) {
		this.name = name;
		this.value = val;
		this.wikitext = '|' + wikitext;
	}
}

// parseTemplates() and processTemplateText() are adapted from
// https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js written by Evad37
// which was in turn adapted from https://en.wikipedia.org/wiki/User:SD0001/parseAllTemplates.js
// written by me. (cc-by-sa/GFDL)

/** See {@link MwnWikitext.parseTemplates} */
export function parseTemplates(wikitext: string, config: TemplateConfig): Template[] {
	config = config || {
		recursive: false,
		namePredicate: null,
		templatePredicate: null,
		count: null,
	};

	const result = [];

	const n = wikitext.length;

	// number of unclosed braces
	let numUnclosed = 0;

	// are we inside a comment, or between nowiki tags, or in a {{{parameter}}}?
	let inComment = false;
	let inNowiki = false;
	let inParameter = false;

	let startIdx, endIdx;

	for (let i = 0; i < n; i++) {
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
					let templateWikitext = wikitext.slice(startIdx, endIdx); // without braces
					let processed = processTemplateText(
						templateWikitext,
						config.namePredicate,
						config.templatePredicate,
					);
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
				// swap out pipes in nested templates with \x01 character
				wikitext = strReplaceAt(wikitext, i, '\x01');
			} else if (/^<!--/.test(wikitext.slice(i, i + 4))) {
				inComment = true;
				i += 3;
			} else if (/^<nowiki ?>/.test(wikitext.slice(i, i + 9))) {
				inNowiki = true;
				i += 7;
			}
		} else {
			// we are in a comment or nowiki or {{{parameter}}}
			if (wikitext[i] === '|') {
				// swap out pipes with \x01 character
				wikitext = strReplaceAt(wikitext, i, '\x01');
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
		let subtemplates = result
			.map((template) => {
				return template.wikitext.slice(2, -2);
			})
			.filter((templateWikitext) => {
				return /\{\{.*\}\}/s.test(templateWikitext);
			})
			.map((templateWikitext) => {
				return parseTemplates(templateWikitext, config);
			});
		return result.concat(...subtemplates);
	}

	return result;
}

/**
 * @param {string} text - template wikitext without braces, with the pipes in
 * nested templates replaced by \x01
 * @param {Function} [namePredicate]
 * @param {Function} [templatePredicate]
 * @returns {Template}
 */
function processTemplateText(
	text: string,
	namePredicate: (name: string | number) => boolean,
	templatePredicate: (template: Template) => boolean,
) {
	// eslint-disable-next-line no-control-regex
	const template = new Template('{{' + text.replace(/\x01/g, '|') + '}}');

	// swap out pipe in links with \x01 control character
	// [[File: ]] can have multiple pipes, so might need multiple passes
	while (/(\[\[[^\]]*?)\|(.*?\]\])/g.test(text)) {
		text = text.replace(/(\[\[[^\]]*?)\|(.*?\]\])/g, '$1\x01$2');
	}

	// Figure out most-used spacing styles for pipes/equals
	template.pipeStyle = mostFrequent(text.match(/[\s\n]*\|[\s\n]*/g)) || ' |';
	template.equalsStyle = mostFrequent(text.replace(/(=[^|]*)=+/g, '$1').match(/[\s\n]*=[\s\n]*/g)) || '=';
	// Figure out end-braces style
	const endSpacing = text.match(/[\s\n]*$/);
	template.endBracesStyle = (endSpacing ? endSpacing[0] : '') + '}}';

	const [name, ...parameterChunks] = text.split('|').map((chunk) => {
		// change '\x01' control characters back to pipes
		// eslint-disable-next-line no-control-regex
		return chunk.replace(/\x01/g, '|');
	});

	template.setName(name);

	if (namePredicate && !namePredicate(template.name)) {
		return null;
	}

	let unnamedIdx = 1;
	parameterChunks.forEach(function (chunk) {
		let indexOfEqualTo = chunk.indexOf('=');
		let indexOfOpenBraces = chunk.indexOf('{{');

		let isWithoutEquals = !chunk.includes('=');
		let hasBracesBeforeEquals = chunk.includes('{{') && indexOfOpenBraces < indexOfEqualTo;
		let isUnnamedParam = isWithoutEquals || hasBracesBeforeEquals;

		let pName, pNum, pVal;
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
}

function strReplaceAt(string: string, index: number, char: string): string {
	return string.slice(0, index) + char + string.slice(index + 1);
}

/**
 * Returns the most frequently occuring item within an array,
 * e.g. `mostFrequent(["apple", "apple", "orange"])` returns `"apple"`
 * @param array
 * @returns item with the highest frequency
 */
// Attribution: https://github.com/wikimedia-gadgets/xfdcloser/blob/fec463806/xfdcloser-src/util.js#L440
function mostFrequent(array: string[]): string | null {
	if (!array || !Array.isArray(array) || array.length === 0) {
		return null;
	}
	const map: Record<string, number> = {};
	let mostFreq: string = null;
	array.forEach((item: string) => {
		map[item] = (map[item] || 0) + 1;
		if (mostFreq === null || map[item] > map[mostFreq]) {
			mostFreq = item;
		}
	});
	return mostFreq;
}
