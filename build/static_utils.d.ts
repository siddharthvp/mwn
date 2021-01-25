/**
 * Static functions on mwn
 */
import type { MwnTitle } from "./bot";
/**
 * Get wikitext for a new link
 * @param target
 * @param [displaytext]
 */
export declare function link(target: string | MwnTitle, displaytext?: string): string;
/**
 * Get wikitext for a template usage
 * @param title
 * @param [parameters={}] - template parameters as object
 */
export declare function template(title: string | MwnTitle, parameters?: {
    [parameter: string]: string;
}): string;
export declare class table {
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
    constructor(config?: {
        plain?: boolean;
        sortable?: boolean;
        style?: string;
        multiline?: boolean;
    });
    _makecell(cell: string | {
        [attribute: string]: string;
    }, isHeader?: boolean): string;
    /**
     * Add the headers
     * @param headers - array of header items
     */
    addHeaders(headers: (string | {
        [attribute: string]: string;
    })[]): void;
    /**
     * Add a row to the table
     * @param fields - array of items on the row,
     * @param attributes - row attributes
     */
    addRow(fields: string[], attributes?: {
        [attribute: string]: string;
    }): void;
    /** Returns the final table wikitext */
    getText(): string;
}
/**
 * Encode the string like PHP's rawurlencode
 *
 * @param {string} str String to be encoded.
 * @return {string} Encoded string
 */
declare function rawurlencode(str: string): string;
/**
 * Check if string is an IPv4 address
 * @param {string} address
 * @param {boolean} [allowBlock=false]
 * @return {boolean}
 */
declare function isIPv4Address(address: string, allowBlock?: boolean): boolean;
/**
 * Check if the string is an IPv6 address
 * @param {string} address
 * @param {boolean} [allowBlock=false]
 * @return {boolean}
 */
declare function isIPv6Address(address: string, allowBlock?: boolean): boolean;
/**
 * Escape string for safe inclusion in regular expression.
 * The following characters are escaped:
 *     \ { } ( ) | . ? * + - ^ $ [ ]
 * @param {string} str String to escape
 * @return {string} Escaped string
 */
declare function escapeRegExp(str: string): string;
/**
 * Escape a string for HTML. Converts special characters to HTML entities.
 *
 *     Util.escapeHtml( '< > \' & "' );
 *     // Returns &lt; &gt; &#039; &amp; &quot;
 *
 * @param {string} s - The string to escape
 * @return {string} HTML
 */
declare function escapeHtml(s: string): string;
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
declare function wikiUrlencode(str: string): string;
/**
 * Check whether a string is an IP address
 * @param {string} address String to check
 * @param {boolean} [allowBlock=false] True if a block of IPs should be allowed
 * @return {boolean}
 */
declare function isIPAddress(address: string, allowBlock?: boolean): boolean;
export declare const util: {
    escapeRegExp: typeof escapeRegExp;
    escapeHtml: typeof escapeHtml;
    rawurlencode: typeof rawurlencode;
    wikiUrlencode: typeof wikiUrlencode;
    isIPv4Address: typeof isIPv4Address;
    isIPv6Address: typeof isIPv6Address;
    isIPAddress: typeof isIPAddress;
};
export {};
