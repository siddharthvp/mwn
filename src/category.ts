import type { Mwn, MwnPage, MwnTitle } from './bot';
import { ApiQueryCategoryMembersParams } from './api_params';

type ApiPageInfo = {
	pageid: number;
	ns: number;
	title: string;
};

export interface MwnCategoryStatic {
	/**
	 * @param {string} name - name of the category
	 */
	new (name: MwnTitle | string): MwnCategory;
}

export interface MwnCategory extends MwnPage {
	/**
	 * Get all members in the category - this includes subcategories, pages and files
	 * @param {Object} options - additional API parameters
	 * @returns {Promise<Object[]>} - Resolved with array of objects of form
	 * { pageid: 324234, ns: 0, title: 'Main Page' }
	 */
	members(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
	membersGen(options?: ApiQueryCategoryMembersParams): AsyncGenerator<ApiPageInfo>;
	/**
	 * Get all pages in the category - does not include subcategories or files
	 * @param {Object} options - additional API parameters
	 * @returns {Promise<Object[]>} - Resolved with array of objects of form
	 * { pageid: 324234, ns: 0, title: 'Main Page' }
	 */
	pages(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
	/**
	 * Get all subcategories of the category
	 * @param {Object} options - additional API parameters
	 * @returns {Promise<Object[]>} - Resolved with array of objects of form
	 * { pageid: 324234, ns: 14, title: 'Category:Living people' }
	 */
	subcats(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
	/**
	 * Get all files in the category
	 * @param {Object} options - additional API parameters
	 * @returns {Promise<Object[]>} - Resolved with array of objects of form
	 * { pageid: 324234, ns: 6, title: 'File:Image.jpg' }
	 */
	files(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
}

export default function (bot: Mwn) {
	class Category extends bot.Page implements MwnCategory {
		/** @inheritDoc */
		constructor(name: MwnTitle | string) {
			super(name, 14);
			if (this.namespace !== 14) {
				throw new Error('not a category page');
			}
		}

		// TODO: Add recursive modes

		/** @inheritDoc */
		members(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]> {
			return bot
				.query({
					list: 'categorymembers',
					cmtitle: 'Category:' + this.title,
					cmlimit: 'max',
					...options,
				})
				.then((data) => data.query.categorymembers);
		}

		async *membersGen(options?: ApiQueryCategoryMembersParams): AsyncGenerator<ApiPageInfo> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + this.title,
				cmlimit: 'max',
				...options,
			});
			for await (let json of continuedQuery) {
				for (let result of json.query.categorymembers) {
					yield result;
				}
			}
		}

		/** @inheritDoc */
		pages(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]> {
			return this.members({ cmtype: ['page'], ...options });
		}

		/** @inheritDoc */
		subcats(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]> {
			return this.members({ cmtype: ['subcat'], ...options });
		}

		/** @inheritDoc */
		files(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]> {
			return this.members({ cmtype: ['file'], ...options });
		}
	}

	return Category as MwnCategoryStatic;
}
