/**
 * Class for wikitext parsing into an AST, involving
 * links, files, categories, templates and simple tables
 * and sections.
 *
 * This class is for methods for parsing wikitext, for the
 * static methods for creating wikitext, see static_utils.js.
 */

import { log } from './log';
import { Unbinder, Template } from './wikitext';
import type { Mwn } from './bot';
import type { Link, PageLink, FileLink, CategoryLink, Section, TemplateConfig } from './wikitext';
import type * as Parser from 'wikiparser-node';

export interface Token extends Parser.Token {} // eslint-disable-line @typescript-eslint/no-empty-object-type

export interface MwnWikitextASTStatic {
	new (text: string): MwnWikitextAST;

	/** Static version of {@link MwnWikitextAST.parseTemplates} */
	parseTemplates(wikitext: string, config: TemplateConfig): Promise<Template[]>;

	/**
	 * Simple table parser from AST.
	 * Parses tables provided:
	 *  1. The table header doesn't have any merged or joined cells.
	 *  2. It doesn't use any templates to produce any table markup.
	 *  3. Further restrictions may apply.
	 *
	 * This method throws when it finds an inconsistency (rather than silently
	 * cause undesired behaviour).
	 *
	 * @param {string} text
	 * @returns {Promise<Object[]>} - each object in the returned array represents a row,
	 * with its keys being column names, and values the cell content
	 */
	parseTable(text: string): Promise<
		{
			[column: string]: string;
		}[]
	>;

	/** Static version of {@link MwnWikitextAST.parseSections} */
	parseSections(text: string): Promise<Section[]>;

	/** Static version of {@link MwnWikitextAST.parseAST} */
	parseAST(text: string): Promise<Token>;
}
export interface MwnWikitextAST extends Unbinder {
	links: Array<PageLink>;
	templates: Array<Template>;
	files: Array<FileLink>;
	categories: Array<CategoryLink>;
	sections: Array<Section>;
	AST: Token;
	/** Parse links, file usages and categories from the AST */
	parseLinks(): Promise<void>;
	/**
	 * Parses templates from AST.
	 * Returns an array of Template objects
	 * @param {TemplateConfig} config
	 * @returns {Promise<Template[]>}
	 */
	parseTemplates(config: TemplateConfig): Promise<Template[]>;
	/**
	 * Remove a template, link, file or category from the text
	 * CAUTION: If an entity with the very same wikitext exists earlier in the text,
	 * that one will be removed instead.
	 * @param {Object|Template} entity - anything with a wikitext attribute
	 * and end index
	 */
	removeEntity(entity: Link | Template): void;
	/**
	 * Parse sections from AST
	 * @returns {Promise<Section[]>} array of
	 * section objects. Each section object has the level, header, index (of beginning) and content.
	 * Content *includes* the equal signs and the header.
	 * The top is represented as level 1, with header `null`.
	 */
	parseSections(): Promise<Section[]>;
	/**
	 * Parse AST from wikitext
	 * @returns {Promise<Token>} a promise that resolves to the root token of an AST.
	 */
	parseAST(): Promise<Token>;
}

export default function (bot: Mwn) {
	class WikitextAST extends Unbinder implements MwnWikitextAST {
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
		async parseLinks(): Promise<void> {
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
		async parseTemplates(config?: TemplateConfig): Promise<Template[]> {
			config = config || {
				recursive: false,
				namePredicate: null,
				templatePredicate: null,
				count: null,
			};
			this.templates = [];

			if (!this.AST) {
				await this.parseAST();
			}

			for (const token of this.AST.querySelectorAll<Parser.TranscludeToken>('template')) {
				if (this.templates.length === config.count) {
					break;
				} else if (!config.recursive && token.closest('template')) {
					continue;
				}
				// @ts-expect-error private method
				const name: string = token.getAttribute('title').main;
				if (config.namePredicate && !config.namePredicate(name)) {
					continue;
				}
				const template = new Template(String(token));
				template.setName(name);
				for (const param of token.getAllArgs()) {
					template.addParam(param.anon ? Number(param.name) : param.name, param.value, String(param));
				}
				if (config.templatePredicate && !config.templatePredicate(template)) {
					continue;
				}
				this.templates.push(template);
			}
			return this.templates;
		}

		/** @inheritDoc */
		removeEntity(entity: Link | Template) {
			this.text = this.text.replace(entity.wikitext, '');
		}

		/** @inheritDoc */
		async parseSections(): Promise<Section[]> {
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
			return (this.AST = await WikitextAST.parseAST(this.text));
		}

		static async parseTemplates(text: string, config?: TemplateConfig): Promise<Template[]> {
			return new this(text).parseTemplates(config);
		}
		static async parseTable(text: string): Promise<
			{
				[column: string]: string | undefined;
			}[]
		> {
			const table = (await this.parseAST(text)).querySelector<Parser.TableToken>('table');
			if (!table) {
				throw new Error('No table found');
			}
			const headers = table.getNthRow(0).querySelectorAll<Parser.TdToken>('td');
			if (headers.some((header) => header.colspan > 1 || header.rowspan > 1)) {
				throw new Error('Table headers cannot have merged or joined cells');
			}
			const rows = [],
				cols = headers.map(({ innerText }) => innerText);
			for (let i = 1; i < table.getRowCount(); i++) {
				const row: Record<string, string | null> = {};
				rows.push(row);
				for (let j = 0; j < headers.length; j++) {
					const cell = table.getNthCell({ x: j, y: i });
					row[cols[j]!] = cell?.innerText;
				}
			}
			return rows;
		}

		static async parseSections(text: string): Promise<Section[]> {
			return new this(text).parseSections();
		}
		static async parseAST(text: string): Promise<Token> {
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
		}
	}

	return WikitextAST;
}
