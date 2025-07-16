/**
 * Class for some basic wikitext parsing, involving
 * links, files, categories, templates and simple tables
 * and sections.
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

import { log } from './log';
import type { Mwn } from './bot';
import type { MwnTitle } from './title';
import type { ApiParseParams } from 'types-mediawiki-api';
import type * as Parser from 'wikiparser-node';

export interface Token extends Parser.Token {} // eslint-disable-line @typescript-eslint/no-empty-object-type

export interface MwnWikitextStatic {
	new (text: string): MwnWikitext;

	/** Static version of {@link MwnWikitext.parseTemplates} */
	parseTemplates(wikitext: string, config: TemplateConfig): Template[];

	/**
	 * Simple table parser.
	 * Parses tables provided:
	 *  1. It doesn't have any merged or joined cells.
	 *  2. It doesn't use any templates to produce any table markup.
	 *  3. Further restrictions may apply.
	 *
	 * Tables generated via mwn.Table() class are intended to be parsable.
	 *
	 * This method throws when it finds an inconsistency (rather than silently
	 * cause undesired behaviour).
	 *
	 * @param {string} text
	 * @returns {Object[]} - each object in the returned array represents a row,
	 * with its keys being column names, and values the cell content
	 */
	parseTable(text: string): {
		[column: string]: string;
	}[];

	/** Static version of {@link MwnWikitext.parseSections} */
	parseSections(text: string): Section[];

	/** Static version of {@link MwnWikitext.parseAST} */
	parseAST(text: string): Promise<Token>;
}
export interface MwnWikitext extends Unbinder {
	links: Array<PageLink>;
	templates: Array<Template>;
	files: Array<FileLink>;
	categories: Array<CategoryLink>;
	sections: Array<Section>;
	AST: Token;
	/** Parse links, file usages and categories from the wikitext */
	parseLinks(): void;
	/** Parse links, file usages and categories from the AST */
	parseLinksFromAST(): Promise<void>;
	/**
	 * Parses templates from wikitext.
	 * Returns an array of Template objects
	 * ```js
	 * let templates = parseTemplates("Hello {{foo |Bar|baz=qux |2=loremipsum|3=}} world");
	 *  console.log(templates[0]); // gives:
	 *		{
	 *			name: "foo",
	 *			wikitext:"{{foo |Bar|baz=qux | 2 = loremipsum  |3=}}",
	 *			parameters: [ { name: 1, value: 'Bar', wikitext: '|Bar' },
	 *				{ name: 'baz', value: 'qux', wikitext: '|baz=qux ' },
	 *				{ name: '2', value: 'loremipsum', wikitext: '| 2 = loremipsum  ' },
	 *				{ name: '3', value: '', wikitext: '|3=' }
	 *			]
	 *		}
	 *```
	 * @param {TemplateConfig} config
	 * @returns {Template[]}
	 */
	parseTemplates(config: TemplateConfig): Template[];
	/**
	 * Remove a template, link, file or category from the text
	 * CAUTION: If an entity with the very same wikitext exists earlier in the text,
	 * that one will be removed instead.
	 * @param {Object|Template} entity - anything with a wikitext attribute
	 * and end index
	 */
	removeEntity(entity: Link | Template): void;
	/**
	 * Parse sections from wikitext
	 * CAUTION: section header syntax in comments, nowiki tags,
	 * pre, source or syntaxhighlight tags can lead to wrong results.
	 * You're advised to run unbind() first.
	 * @returns {Section[]} array of
	 * section objects. Each section object has the level, header, index (of beginning) and content.
	 * Content *includes* the equal signs and the header.
	 * The top is represented as level 1, with header `null`.
	 */
	parseSections(): Section[];
	/**
	 * Parse sections from AST
	 * @returns {Promise<Section[]>} array of
	 * section objects. Each section object has the level, header, index (of beginning) and content.
	 * Content *includes* the equal signs and the header.
	 * The top is represented as level 1, with header `null`.
	 */
	parseSectionsFromAST(): Promise<Section[]>;
	/**
	 * Parse AST from wikitext
	 * @returns {Promise<Token>} a promise that resolves to the root token of an AST.
	 */
	parseAST(): Promise<Token>;
	/**
	 * Parse the text using the API.
	 * @see https://www.mediawiki.org/wiki/API:Parsing_wikitext
	 * @param {Object} [options] - additional API options
	 * @returns {Promise<string>}
	 */
	apiParse(options: ApiParseParams): Promise<string>;
}

export interface Link {
	wikitext: string;
	target: MwnTitle;
}

export interface PageLink extends Link {
	displaytext: string;
}

export interface FileLink extends Link {
	props: string;
}

export interface CategoryLink extends Link {
	sortkey: string;
}

export interface Section {
	level: number;
	header: string | null;
	index: number;
	content: string;
}

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
	 * Include template in result only if its name matches this predicate.
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
 * Represents the wikitext of template transclusion. Used by {@link MwnWikitext.parseTemplates}.
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
export function parseTemplates(wikitext: string, config?: TemplateConfig): Template[] {
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
						config.templatePredicate
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
	templatePredicate: (template: Template) => boolean
) {
	// eslint-disable-next-line no-control-regex
	const template = new Template('{{' + text.replace(/\x01/g, '|') + '}}');

	// swap out pipe in links with \x01 control character
	// [[File: ]] can have multiple pipes, so might need multiple passes
	while (/(\[\[[^\]]*?)\|(.*?\]\])/g.test(text)) {
		text = text.replace(/(\[\[[^\]]*?)\|(.*?\]\])/g, '$1\x01$2');
	}

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

/** See {@link MwnWikitextStatic.parseTable} */
export function parseTable(text: string): { [column: string]: string }[] {
	text = text.trim();
	const indexOfRawPipe = function (text: string) {
		// number of unclosed brackets
		let tlevel = 0,
			llevel = 0;

		let n = text.length;
		for (let i = 0; i < n; i++) {
			if (text[i] === '{' && text[i + 1] === '{') {
				tlevel++;
				i++;
			} else if (text[i] === '[' && text[i + 1] === '[') {
				llevel++;
				i++;
			} else if (text[i] === '}' && text[i + 1] === '}') {
				tlevel--;
				i++;
			} else if (text[i] === ']' && text[i + 1] === ']') {
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

	let [header, ...rows] = text.split(/^\|-/m).map((r) => r.trim());

	// remove cell attributes, extracts data
	const extractData = (cell: string) => {
		return cell.slice(indexOfRawPipe(cell) + 1).trim();
	};

	// XXX: handle the case where there are is no header row
	let cols = header.split('\n').map((e) => e.replace(/^!/, ''));

	if (cols.length === 1) {
		// non-multilined table?
		cols = cols[0].split('!!');
	}
	cols = cols.map(extractData);

	let numcols = cols.length;

	let output = new Array(rows.length);

	rows.forEach((row, idx) => {
		let cells = row.split(/^\|/m).slice(1); // slice(1) removes the emptiness or the row styles if present

		if (cells.length === 1) {
			// non-multilined
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

/** See {@link MwnWikitext.parseSections} */
export function parseSections(text: string): Section[] {
	const rgx = /^(=+)(.*?)\1/gm;
	let sections: Section[] = [
		{
			level: 1,
			header: null,
			index: 0,
		} as Section,
	];
	let match;
	while ((match = rgx.exec(text))) {
		// eslint-disable-line no-cond-assign
		sections.push({
			level: match[1].length,
			header: match[2].trim(),
			index: match.index,
		} as Section);
	}
	let n = sections.length;
	for (let i = 0; i < n - 1; i++) {
		sections[i].content = text.slice(sections[i].index, sections[i + 1].index);
	}
	sections[n - 1].content = text.slice(sections[n - 1].index);
	return sections;
}

// Attribution: https://en.wikipedia.org/wiki/MediaWiki:Gadget-morebits.js (cc-by-sa 3.0/GFDL)
export class Unbinder {
	text: string;

	constructor(text: string) {
		this.text = text;
	}

	private unbinder: {
		counter: number;
		history: {
			[replaced: string]: string;
		};
		prefix: string;
		postfix: string;
	};

	/**
	 * Temporarily hide a part of the string while processing the rest of it.
	 *
	 * eg.  let u = new bot.Wikitext("Hello world <!-- world --> world");
	 *      u.unbind('<!--','-->');
	 *      u.content = u.content.replace(/world/g, 'earth');
	 *      u.rebind(); // gives "Hello earth <!-- world --> earth"
	 *
	 * Text within the 'unbinded' part (in this case, the HTML comment) remains intact
	 * unbind() can be called multiple times to unbind multiple parts of the string.
	 *
	 * @param {string} prefix
	 * @param {string} postfix
	 */
	unbind(prefix: string, postfix: string): void {
		if (!this.unbinder) {
			this.unbinder = {
				counter: 0,
				history: {},
				prefix: '%UNIQ::' + Math.random() + '::',
				postfix: '::UNIQ%',
			};
		}
		let re = new RegExp(prefix + '([\\s\\S]*?)' + postfix, 'g');
		this.text = this.text.replace(re, (match) => {
			let current = this.unbinder.prefix + this.unbinder.counter + this.unbinder.postfix;
			this.unbinder.history[current] = match;
			++this.unbinder.counter;
			return current;
		});
	}

	/**
	 * Rebind after unbinding.
	 */
	rebind(): string {
		let content = this.text;
		for (let [current, replacement] of Object.entries(this.unbinder.history)) {
			content = content.replace(current, replacement);
		}
		this.text = content;
		return this.text;
	}

	/** Get the updated text */
	getText(): string {
		return this.text;
	}
}

export default function (bot: Mwn) {
	class Wikitext extends Unbinder implements MwnWikitext {
		links: Array<PageLink>;
		templates: Array<Template>;
		files: Array<FileLink>;
		categories: Array<CategoryLink>;
		sections: Section[];
		AST: Token;

		constructor(wikitext: string) {
			if (typeof wikitext !== 'string') {
				throw new Error('non-string constructor for wikitext class');
			}
			super(wikitext);
		}

		/** @inheritDoc */
		parseLinks(): void {
			this.links = [];
			this.files = [];
			this.categories = [];

			let n = this.text.length;
			// files can have links in captions; use a stack to handle the nesting
			let stack = new Stack();
			for (let i = 0; i < n; i++) {
				if (this.text[i] === '[' && this.text[i + 1] === '[') {
					stack.push({
						startIdx: i,
					});
					i++;
				} else if (this.text[i] === ']' && this.text[i + 1] === ']' && stack.top()) {
					stack.top().endIdx = i + 1;
					processLink(this, stack.top().startIdx, stack.top().endIdx);
					stack.pop();
					i++; // necessary to handle cases like [[File:ImageName|thumb|A [[hill]]]]
				}
			}
		}

		/** @inheritDoc */
		async parseLinksFromAST(): Promise<void> {
			this.links = [];
			this.files = [];
			this.categories = [];

			if (!this.AST) {
				await this.parseAST();
			}

			this.links = this.AST.querySelectorAll<Parser.LinkToken>('link').map((token) => ({
				wikitext: String(token),
				target: bot.Title.newFromText(token.name),
				displaytext: token.innerText,
			}));
			this.files = this.AST.querySelectorAll<Parser.FileToken>('file').map((token) => ({
				wikitext: String(token),
				target: bot.Title.newFromText(token.name),
				props: token.getAllArgs().map(String).join('|'),
			}));
			this.categories = this.AST.querySelectorAll<Parser.CategoryToken>('category').map((token) => ({
				wikitext: String(token),
				target: bot.Title.newFromText(token.name),
				sortkey: token.sortkey || '',
			}));
		}

		/** @inheritDoc */
		parseTemplates(config?: TemplateConfig): Template[] {
			return (this.templates = parseTemplates(this.text, config));
		}

		/** @inheritDoc */
		removeEntity(entity: Link | Template) {
			this.text = this.text.replace(entity.wikitext, '');
		}

		/** @inheritDoc */
		apiParse(options?: ApiParseParams): Promise<string> {
			return bot.parseWikitext(this.text, options);
		}

		/** @inheritDoc */
		parseSections(): Section[] {
			return (this.sections = parseSections(this.text));
		}

		/** @inheritDoc */
		async parseSectionsFromAST(): Promise<Section[]> {
			this.sections = [];

			if (!this.AST) {
				await this.parseAST();
			}

			return this.AST.sections().map((section) => {
				const heading = section.startContainer.childNodes[section.startOffset];
				if (heading.type === 'heading') {
					return {
						level: (heading as Parser.HeadingToken).level,
						header: (heading as Parser.HeadingToken).innerText,
						index: section.startIndex,
						content: String(section),
					};
				}
				return {
					level: 1,
					header: null,
					index: 0,
					content: String(section),
				};
			});
		}

		/** @inheritDoc */
		async parseAST(): Promise<Token> {
			return (this.AST = await Wikitext.parseAST(this.text));
		}

		static parseTemplates = parseTemplates;
		static parseTable = parseTable;
		static parseSections = parseSections;
		static parseAST = async (text: string): Promise<Token> => {
			const Parser = (await import('wikiparser-node')).default;
			const { apiUrl } = bot.options;
			let site = 'mwn';
			let scriptPath: string;
			try {
				[site, scriptPath] = Parser.getWMFSite(apiUrl);
				scriptPath += '/w/';
			} catch {
				if (/\/api\.php$/i.test(apiUrl)) {
					scriptPath = apiUrl.slice(0, -7);
				} else {
					log('API URL does not end with "/api.php". Use default parser config.');
					Parser.config = 'default';
				}
			}
			if (scriptPath) {
				Parser.config = await Parser.fetchConfig(site, scriptPath);
			}
			return Parser.parse(text);
		};
	}

	/**** Private members *****/

	function processLink(self: Wikitext, startIdx: number, endIdx: number) {
		let linktext = self.text.slice(startIdx, endIdx + 1);
		let [target, displaytext] = linktext.slice(2, -2).split('|');
		let noSortkey = false;
		if (!displaytext) {
			displaytext = target[0] === ':' ? target.slice(1) : target;
			noSortkey = true;
		}
		let title = bot.Title.newFromText(target);
		if (!title) {
			return;
		}
		if (target[0] !== ':') {
			if (title.namespace === 6) {
				self.files.push({
					wikitext: linktext,
					target: title,
					props: linktext.slice(linktext.indexOf('|') + 1, -2),
				});
				return;
			} else if (title.namespace === 14) {
				self.categories.push({
					wikitext: linktext,
					target: title,
					sortkey: noSortkey ? '' : displaytext,
				});
				return;
			}
		}
		self.links.push({
			wikitext: linktext,
			target: title,
			displaytext: displaytext,
		});
	}

	return Wikitext as MwnWikitextStatic;
}

class Stack extends Array {
	top() {
		return this[this.length - 1];
	}
}

function strReplaceAt(string: string, index: number, char: string): string {
	return string.slice(0, index) + char + string.slice(index + 1);
}
