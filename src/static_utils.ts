/**
 * Static functions on mwn
 */

import type { MwnTitle } from './bot';

/**
 * Get wikitext for a new link
 * @param target
 * @param [displaytext]
 */
export function link(target: string | MwnTitle, displaytext?: string): string {
	if (typeof target === 'string') {
		return '[[' + target + (displaytext ? '|' + displaytext : '') + ']]';
	}
	return (
		'[[' +
		target.toText() +
		(target.fragment ? '#' + target.fragment : '') +
		(displaytext ? '|' + displaytext : '') +
		']]'
	);
}

/**
 * Get wikitext for a template usage
 * @param title
 * @param [parameters={}] - template parameters as object
 */
export function template(title: string | MwnTitle, parameters: { [parameter: string]: string } = {}): string {
	if (typeof title !== 'string') {
		// title object provided
		if (title.namespace === 10) {
			title = title.getMainText(); // skip namespace name for templates
		} else if (title.namespace === 0) {
			title = ':' + title.toText(); // prefix colon for mainspace
		} else {
			title = title.toText();
		}
	}
	return (
		'{{' +
		title +
		Object.entries(parameters)
			.filter(([, value]) => !!value) // ignore params with no value
			.map(([name, value]) => `|${name}=${value}`)
			.join('') +
		'}}'
	);
}

export class table {
	text: string;
	multiline: boolean;

	/**
	 * @param {Object} [config={}]
	 * @config {boolean} plain - plain table without borders (default: false)
	 * @config {boolean} sortable - make columns sortable (default: true)
	 * @config {string} style - style attribute
	 * @config {boolean} multiline - put each cell of the table on a new line,
	 * this causes no visual changes, but the wikitext representation is different.
	 * This is more reliable. (default: true)
	 */
	constructor(
		config: {
			plain?: boolean;
			sortable?: boolean;
			style?: string;
			multiline?: boolean;
			classes?: string[];
		} = {}
	) {
		let classes = new Set(config.classes);
		if (!config.plain) {
			classes.add('wikitable');
		}
		if (config.sortable !== false) {
			classes.add('sortable');
		}
		if (config.multiline !== false) {
			this.multiline = true;
		}
		this.text = `{|`;
		if (classes.size) {
			this.text += ` class="${[...classes].join(' ')}"`;
		}
		if (config.style) {
			this.text += ` style="${config.style}"`;
		}
		this.text += '\n';
	}

	_makecell(cell: string | { [attribute: string]: string }, isHeader?: boolean): string {
		// typeof null is also object!
		if (cell && typeof cell === 'object') {
			let text = isHeader ? `scope="col"` : ``;
			for (let [key, value] of Object.entries(cell)) {
				if (key === 'label') {
					continue;
				}
				text += ` ${key}="${value}"`;
			}
			text += ` | ${cell.label}`;
			return text;
		}
		return String(cell);
	}
	/**
	 * Add the headers
	 * @param headers - array of header items
	 */
	addHeaders(headers: (string | { [attribute: string]: string })[]): void {
		this.text += `|-\n`; // row separator
		if (this.multiline) {
			this.text += headers.map((e) => `! ${this._makecell(e, true)} \n`).join('');
		} else {
			this.text += `! ` + headers.map((e) => this._makecell(e, true)).join(' !! ') + '\n';
		}
	}

	/**
	 * Add a row to the table
	 * @param fields - array of items on the row,
	 * @param attributes - row attributes
	 */
	addRow(fields: string[], attributes: { [attribute: string]: string } = {}): void {
		let attributetext = '';
		Object.entries(attributes).forEach(([key, value]) => {
			attributetext += ` ${key}="${value}"`;
		});
		this.text += `|-${attributetext}\n`; // row separator
		if (this.multiline) {
			this.text += fields.map((e) => `| ${this._makecell(e)} \n`).join('');
		} else {
			this.text += `| ` + fields.map((f) => this._makecell(f)).join(' || ') + '\n';
		}
	}

	/** Returns the final table wikitext */
	getText(): string {
		return this.text + `|}`; // add the table closing tag and return
	}
}

/**
 * Encode the string like PHP's rawurlencode
 *
 * @param {string} str String to be encoded.
 * @return {string} Encoded string
 */
function rawurlencode(str: string): string {
	return encodeURIComponent(String(str))
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/\*/g, '%2A')
		.replace(/~/g, '%7E');
}

/**
 * Check if string is an IPv4 address
 * @param {string} address
 * @param {boolean} [allowBlock=false]
 * @return {boolean}
 */
function isIPv4Address(address: string, allowBlock?: boolean): boolean {
	let block,
		RE_IP_BYTE = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|0?[0-9]?[0-9])',
		RE_IP_ADD = '(?:' + RE_IP_BYTE + '\\.){3}' + RE_IP_BYTE;
	if (typeof address !== 'string') {
		return false;
	}
	block = allowBlock ? '(?:\\/(?:3[0-2]|[12]?\\d))?' : '';
	return new RegExp('^' + RE_IP_ADD + block + '$').test(address);
}

/**
 * Check if the string is an IPv6 address
 * @param {string} address
 * @param {boolean} [allowBlock=false]
 * @return {boolean}
 */
function isIPv6Address(address: string, allowBlock?: boolean): boolean {
	let block, RE_IPV6_ADD;
	if (typeof address !== 'string') {
		return false;
	}
	block = allowBlock ? '(?:\\/(?:12[0-8]|1[01][0-9]|[1-9]?\\d))?' : '';
	RE_IPV6_ADD =
		'(?:' + // starts with "::" (including "::")
		':(?::|(?::' +
		'[0-9A-Fa-f]{1,4}' +
		'){1,7})' +
		'|' + // ends with "::" (except "::")
		'[0-9A-Fa-f]{1,4}' +
		'(?::' +
		'[0-9A-Fa-f]{1,4}' +
		'){0,6}::' +
		'|' + // contains no "::"
		'[0-9A-Fa-f]{1,4}' +
		'(?::' +
		'[0-9A-Fa-f]{1,4}' +
		'){7}' +
		')';
	if (new RegExp('^' + RE_IPV6_ADD + block + '$').test(address)) {
		return true;
	}
	// contains one "::" in the middle (single '::' check below)
	RE_IPV6_ADD = '[0-9A-Fa-f]{1,4}' + '(?:::?' + '[0-9A-Fa-f]{1,4}' + '){1,6}';
	return new RegExp('^' + RE_IPV6_ADD + block + '$').test(address) && /::/.test(address) && !/::.*::/.test(address);
}

/**
 * Escape string for safe inclusion in regular expression.
 * The following characters are escaped:
 *     \ { } ( ) | . ? * + - ^ $ [ ]
 * @param {string} str String to escape
 * @return {string} Escaped string
 */
function escapeRegExp(str: string): string {
	// eslint-disable-next-line no-useless-escape
	return str.replace(/([\\{}()|.?*+\-^$\[\]])/g, '\\$1');
}

/**
 * Escape a string for HTML. Converts special characters to HTML entities.
 *
 *     Util.escapeHtml( '< > \' & "' );
 *     // Returns &lt; &gt; &#039; &amp; &quot;
 *
 * @param {string} s - The string to escape
 * @return {string} HTML
 */
function escapeHtml(s: string): string {
	return s.replace(/['"<>&]/g, function escapeCallback(s) {
		switch (s) {
			case "'":
				return '&#039;';
			case '"':
				return '&quot;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
		}
	});
}

/**
 * Encode page titles for use in a URL like mw.util.wikiUrlencode()
 *
 * We want / and : to be included as literal characters in our title URLs
 * as they otherwise fatally break the title. The others are decoded because
 * we can, it's prettier and matches behaviour of `wfUrlencode` in PHP.
 *
 * @param {string} str String to be encoded.
 * @return {string} Encoded string
 */
function wikiUrlencode(str: string): string {
	return (
		rawurlencode(str)
			.replace(/%20/g, '_')
			// wfUrlencode replacements
			.replace(/%3B/g, ';')
			.replace(/%40/g, '@')
			.replace(/%24/g, '$')
			.replace(/%21/g, '!')
			.replace(/%2A/g, '*')
			.replace(/%28/g, '(')
			.replace(/%29/g, ')')
			.replace(/%2C/g, ',')
			.replace(/%2F/g, '/')
			.replace(/%7E/g, '~')
			.replace(/%3A/g, ':')
	);
}

/**
 * Check whether a string is an IP address
 * @param {string} address String to check
 * @param {boolean} [allowBlock=false] True if a block of IPs should be allowed
 * @return {boolean}
 */
function isIPAddress(address: string, allowBlock?: boolean): boolean {
	return isIPv4Address(address, allowBlock) || isIPv6Address(address, allowBlock);
}

export const util = {
	escapeRegExp,
	escapeHtml,
	rawurlencode,
	wikiUrlencode,
	isIPv4Address,
	isIPv6Address,
	isIPAddress,
};
