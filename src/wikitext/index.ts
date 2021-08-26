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

import type { mwn } from '../bot';
import type { ApiParseParams } from '../api_params';
import { parseTable } from './table';
import { parseTemplates, Template, TemplateConfig } from './template';
import { Unbinder } from './unbinder';
import { CategoryLink, FileLink, Link, PageLink, parseLinks } from './link';
import { parseSections, Section } from './section';

export * from './link';
export * from './section';
export * from './table';
export * from './template';

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
	 * Tables generated via mwn.table() class are intended to be parsable.
	 *
	 * This method throws when it finds an inconsistency (rather than silently
	 * cause undesired behaviour).
	 *
	 * @param {string} text
	 * @returns {Object[]} - each object in the returned array represents a row,
	 * with its keys being column names, and values the cell content
	 */
	parseTable(
		text: string,
	): {
		[column: string]: string;
	}[];

	/** Static version of {@link MwnWikitext.parseSections} */
	parseSections(text: string): Section[];
}
export interface MwnWikitext extends Unbinder {
	links: Array<PageLink>;
	templates: Array<Template>;
	files: Array<FileLink>;
	categories: Array<CategoryLink>;
	sections: Array<Section>;
	/** Parse links, file usages and categories from the wikitext */
	parseLinks(): void;
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
	 * Parse the text using the API.
	 * @see https://www.mediawiki.org/wiki/API:Parsing_wikitext
	 * @param {Object} [options] - additional API options
	 * @returns {Promise<string>}
	 */
	apiParse(options: ApiParseParams): Promise<string>;
}

export default function (bot: mwn) {
	class Wikitext extends Unbinder implements MwnWikitext {
		links: Array<PageLink>;
		templates: Array<Template>;
		files: Array<FileLink>;
		categories: Array<CategoryLink>;
		sections: Section[];

		constructor(wikitext: string) {
			if (typeof wikitext !== 'string') {
				throw new Error('non-string constructor for wikitext class');
			}
			super(wikitext);
		}

		/** @inheritDoc */
		parseLinks(): void {
			const parsed = parseLinks(this.text, bot);
			this.links = parsed.links;
			this.files = parsed.files;
			this.categories = parsed.categories;
		}

		/** @inheritDoc */
		parseTemplates(config: TemplateConfig): Template[] {
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

		static parseTemplates = parseTemplates;
		static parseTable = parseTable;
		static parseSections = parseSections;
	}

	return Wikitext as MwnWikitextStatic;
}
