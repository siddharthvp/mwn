/**
 * Static functions on mwn
 */
import type { MwnTitle } from "./bot";
declare function rawurlencode(str: string): string;
declare function isIPv4Address(address: string, allowBlock?: boolean): boolean;
declare function isIPv6Address(address: string, allowBlock?: boolean): boolean;
declare const _default: {
    /**
     * Get wikitext for a new link
     * @param target
     * @param [displaytext]
     */
    link: (target: string | MwnTitle, displaytext?: string) => string;
    /**
     * Get wikitext for a template usage
     * @param title
     * @param [parameters={}] - template parameters as object
     */
    template: (title: string | MwnTitle, parameters?: {
        [parameter: string]: string;
    }) => string;
    table: {
        new (config?: {
            plain?: boolean;
            sortable?: boolean;
            style?: string;
            multiline?: boolean;
        }): {
            text: string;
            multiline: boolean;
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
        };
    };
    util: {
        /**
         * Escape string for safe inclusion in regular expression.
         * The following characters are escaped:
         *     \ { } ( ) | . ? * + - ^ $ [ ]
         * @param {string} str String to escape
         * @return {string} Escaped string
         */
        escapeRegExp: (str: string) => string;
        /**
         * Escape a string for HTML. Converts special characters to HTML entities.
         *
         *     Util.escapeHtml( '< > \' & "' );
         *     // Returns &lt; &gt; &#039; &amp; &quot;
         *
         * @param {string} s - The string to escape
         * @return {string} HTML
         */
        escapeHtml: (s: string) => string;
        /**
         * Encode the string like PHP's rawurlencode
         *
         * @param {string} str String to be encoded.
         * @return {string} Encoded string
         */
        rawurlencode: typeof rawurlencode;
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
        wikiUrlencode: (str: string) => string;
        /**
         * Check if string is an IPv4 address
         * @param {string} address
         * @param {boolean} [allowBlock=false]
         * @return {boolean}
         */
        isIPv4Address: typeof isIPv4Address;
        /**
         * Check if the string is an IPv6 address
         * @param {string} address
         * @param {boolean} [allowBlock=false]
         * @return {boolean}
         */
        isIPv6Address: typeof isIPv6Address;
        /**
         * Check whether a string is an IP address
         * @param {string} address String to check
         * @param {boolean} [allowBlock=false] True if a block of IPs should be allowed
         * @return {boolean}
         */
        isIPAddress: (address: string, allowBlock?: boolean) => boolean;
    };
};
export default _default;
