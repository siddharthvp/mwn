import type { Mwn } from './bot';
import type { MwnTitle } from './title';
import type { MwnPage } from './page';
import { ApiQueryBacklinkspropParams } from 'types-mediawiki-api';
import { ReverseLinkTarget } from './api_response_types';

export interface MwnFileStatic {
	/**
	 * @constructor
	 * @param {string|MwnTitle} name - name of the file
	 */
	new (title: MwnTitle | string): MwnFile;
}
export interface MwnFile extends MwnPage {
	/**
	 * Get the name of the file without extension or namespace prefix.
	 *
	 * @return {string} File name without file extension, in the canonical form with
	 * underscores instead of spaces. For example, the title "File:Example_image.svg"
	 * will be returned as "Example_image".
	 */
	getName(): string;
	/**
	 * Get the name of the file without extension or namespace prefix.
	 *
	 * @return {string} File name without file extension, formatted with spaces instead
	 * of underscores. For example, the title "File:Example_image.svg" will be returned
	 * as "Example image".
	 */
	getNameText(): string;
	/**
	 * Get file usages
	 * @param {Object} options - additional API options
	 * @returns {Promise<Object[]>} - resolved with array of { pageid: 32434,
	 * ns: 0, title: 'Main Page', redirect: false } like objects.
	 */
	usages(options?: ApiQueryBacklinkspropParams): Promise<
		{
			pageid: number;
			title: string;
			redirect: boolean;
		}[]
	>;

	/**
	 * Download an image from the wiki to the local file system
	 * @param localname - local path (with file name) to download to,
	 * defaults to current directory with same file name as on the wiki.
	 */
	download(localname: string): void;
}

export default function (bot: Mwn) {
	class File extends bot.Page implements MwnFile {
		/** @inheritDoc */
		constructor(name: MwnTitle | string) {
			super(name, 6);
			if (this.namespace !== 6) {
				throw new Error('not a file');
			}
		}

		/** @inheritDoc */
		getName(): string {
			let ext = this.getExtension();
			if (ext === null) {
				return this.getMain();
			}
			return this.getMain().slice(0, -ext.length - 1);
		}

		/** @inheritDoc */
		getNameText(): string {
			return this.getName().replace(/_/g, ' ');
		}

		/** @inheritDoc */
		usages(options?: ApiQueryBacklinkspropParams): Promise<ReverseLinkTarget[]> {
			return bot
				.query({
					titles: this.toString(),
					prop: 'fileusage',
					fuprop: 'pageid|title|redirect',
					...options,
				})
				.then((data) => {
					return data.query.pages[0].fileusage || [];
				});
		}

		// TODO: Add wrapper for prop=imageinfo

		/** @inheritDoc */
		download(localname: string) {
			return bot.download(this.toString(), localname);
		}
	}

	return File as MwnFileStatic;
}
