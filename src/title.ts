/**
 *
 * This class is a substantial copy of mw.Title in the MediaWiki on-site
 * JS interface.
 *
 * Adapted from <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.Title/>
 * (GNU GPL v2)
 *
 */

export interface MwnTitleStatic {
	new (title: string, namespace?: number): MwnTitle;
	idNameMap: {
		[namespaceId: number]: string;
	};
	nameIdMap: {
		[namespaceName: string]: number;
	};
	legaltitlechars: string;
	caseSensitiveNamespaces: Array<number>;
	processNamespaceData(json: {
		query: {
			general: {
				legaltitlechars: string;
			};
			namespaces: {
				name: string;
				id: number;
				canonical: boolean;
				case: string;
			}[];
			namespacealiases: {
				alias: string;
				id: number;
			}[];
		};
	}): void;
	checkData(): void;
	newFromText(title: string, namespace?: number): MwnTitle | null;
	makeTitle(namespace: number, title: string): MwnTitle | null;
	isTalkNamespace(namespaceId: number): boolean;
	phpCharToUpper(chr: string): string;
}
export interface MwnTitle {
	title: string;
	namespace: number;
	fragment: string;
	getNamespaceId(): number;
	getMain(): string;
	getMainText(): string;
	getPrefixedDb(): string;
	getPrefixedText(): string;
	getFragment(): string | null;
	isTalkPage(): boolean;
	getTalkPage(): MwnTitle | null;
	getSubjectPage(): MwnTitle | null;
	canHaveTalkPage(): boolean;
	getExtension(): string | null;
	getDotExtension(): string;
	toString(): string;
	toText(): string;
}

export default function () {

	let NS_MAIN = 0;
	let NS_TALK = 1;
	let NS_SPECIAL = -1;

	class Title implements MwnTitle {

		static idNameMap: {
			[namespaceId: number]: string
		}
		static nameIdMap: {
			[namespaceName: string]: number
		}
		static legaltitlechars: string
		static caseSensitiveNamespaces: Array<number>

		static processNamespaceData(json: {
			query: {
				general: { legaltitlechars: string }
				namespaces: { name: string, id: number, canonical: boolean, case: string }[]
				namespacealiases: { alias: string, id: number }[]
			}
		}) {

			let namespaceNorm = ns => (ns || '').toLowerCase().replace(/ /g, '_');

			// Analog of mw.config.get('wgFormattedNamespaces')
			Title.idNameMap = {};

			// Analag of mw.config.get('wgNamespaceIds')
			Title.nameIdMap = {};

			Object.values(json.query.namespaces).forEach(ns => {
				Title.idNameMap[ns.id] = ns.name;
				Title.nameIdMap[namespaceNorm(ns.name)] = ns.id;
				Title.nameIdMap[namespaceNorm(ns.canonical)] = ns.id;
			});
			json.query.namespacealiases.forEach(ns => {
				Title.nameIdMap[namespaceNorm(ns.alias)] = ns.id;
			});

			// Analog of mw.config.get('wgLegalTitleChars')
			Title.legaltitlechars = json.query.general.legaltitlechars;

			// Analog of mw.config.get('wgCaseSensitiveNamespaces')
			Title.caseSensitiveNamespaces = Object.values(json.query.namespaces)
				.filter(ns => ns.case === 'case-sensitive')
				.map(ns => ns.id);
		}

		static checkData() {
			if (!Title.nameIdMap || !Title.idNameMap || !Title.legaltitlechars) {
				throw new Error('namespace data unavailable: run getSiteInfo() or login() first on the mwn object');
			}
		}

		namespace: number
		title: string
		fragment: string

		constructor( title: string, namespace?: number ) {
			let parsed = parse( title, namespace );
			if ( !parsed ) {
				throw new Error( 'Unable to parse title' );
			}
			this.namespace = parsed.namespace;
			this.title = parsed.title;
			this.fragment = parsed.fragment;
		}

		/**
		 * Get the namespace number
		 *
		 * Example: 6 for "File:Example_image.svg".
		 */
		getNamespaceId(): number {
			return this.namespace;
		}

		/**
		 * Get the namespace prefix (in the content language)
		 *
		 * Example: "File:" for "File:Example_image.svg".
		 * In #NS_MAIN this is '', otherwise namespace name plus ':'
		 */
		getNamespacePrefix(): string {
			return getNamespacePrefix( this.namespace );
		}

		/**
		 * Get the main page name
		 *
		 * Example: "Example_image.svg" for "File:Example_image.svg".
		 */
		getMain(): string {
			if (
				Title.caseSensitiveNamespaces.indexOf( this.namespace ) !== -1 ||
				!this.title.length
			) {
				return this.title;
			}
			return Title.phpCharToUpper( this.title[ 0 ] ) + this.title.slice( 1 );
		}

		/**
		 * Get the main page name (transformed by #text)
		 * Example: "Example image.svg" for "File:Example_image.svg".
		 */
		getMainText(): string {
			return this.getMain().replace( /_/g, ' ' );
		}

		/**
		 * Get the full page name
		 *
		 * Example: "File:Example_image.svg".
		 * Most useful for API calls, anything that must identify the "title".
		 */
		getPrefixedDb(): string {
			return this.getNamespacePrefix() + this.getMain();
		}

		/**
		 * Get the full page name (transformed by #text)
		 *
		 * Example: "File:Example image.svg" for "File:Example_image.svg".
		 */
		getPrefixedText(): string {
			return ( this.getPrefixedDb() ).replace( /_/g, ' ' );
		}

		/**
		 * Get the fragment (if any).
		 *
		 * Note that this method (by design) does not include the hash character and
		 * the value is not url encoded.
		 */
		getFragment(): string | null {
			return this.fragment;
		}

		/**
		 * Check if the title is in a talk namespace
		 */
		isTalkPage(): boolean {
			return Title.isTalkNamespace( this.getNamespaceId() );
		}

		/**
		 * Get the title for the associated talk page
		 * Returns null if not available
		 */
		getTalkPage(): Title | null {
			if ( !this.canHaveTalkPage() ) {
				return null;
			}
			return this.isTalkPage() ?
				this :
				Title.makeTitle( this.getNamespaceId() + 1, this.getMainText() );
		}

		/**
		 * Get the title for the subject page of a talk page
		 * Returns null if not available
		 */
		getSubjectPage(): Title | null {
			return this.isTalkPage() ?
				Title.makeTitle( this.getNamespaceId() - 1, this.getMainText() ) :
				this;
		}

		/**
		 * Check if the title can have an associated talk page
		 */
		canHaveTalkPage(): boolean {
			return this.getNamespaceId() >= NS_MAIN;
		}

		/**
		 * Get the extension of the page name (if any)
		 */
		getExtension(): string | null {
			let lastDot = this.title.lastIndexOf( '.' );
			if ( lastDot === -1 ) {
				return null;
			}
			return this.title.slice( lastDot + 1 ) || null;
		}

		/**
		 * Shortcut for appendable string to form the main page name.
		 *
		 * Returns a string like ".json", or "" if no extension.
		 */
		getDotExtension(): string {
			let ext = this.getExtension();
			return ext === null ? '' : '.' + ext;
		}

		/**
		 * Constructor for Title objects with a null return instead of an exception for invalid titles.
		 *
		 * Note that `namespace` is the **default** namespace only, and can be overridden by a namespace
		 * prefix in `title`. If you do not want this behavior, use #makeTitle. See #constructor for
		 * details.
		 * @return {Title|null} A valid Title object or null if the title is invalid
		 */
		static newFromText(title: string, namespace = 0): Title | null {
			let t, parsed = parse( title, namespace );
			if ( !parsed ) {
				return null;
			}
			t = Object.create( Title.prototype );
			t.namespace = parsed.namespace;
			t.title = parsed.title;
			t.fragment = parsed.fragment;
			return t;
		}


		/**
		 * Constructor for Title objects with predefined namespace.
		 *
		 * Unlike #newFromText or #constructor, this function doesn't allow the given `namespace` to be
		 * overridden by a namespace prefix in `title`. See #constructor for details about this behavior.
		 *
		 * The single exception to this is when `namespace` is 0, indicating the main namespace. The
		 * function behaves like #newFromText in that case.
		 * @return {Title|null} A valid Title object or null if the title is invalid
		 */
		static makeTitle(namespace: number, title: string): Title | null {
			return Title.newFromText( getNamespacePrefix( namespace ) + title );
		}

		/**
		 * Check if a given namespace is a talk namespace
		 */
		static isTalkNamespace(namespaceId: number): boolean {
			return !!( namespaceId > NS_MAIN && namespaceId % 2 );
		}

		/**
		 * PHP's strtoupper differs from String.toUpperCase in a number of cases (T147646).
		 *
		 * @param {string} chr Unicode character
		 * @return {string} Unicode character, in upper case, according to the same rules as in PHP
		 */
		static phpCharToUpper(chr: string): string {
			// @ts-ignore
			if ( toUpperMap[ chr ] === '' ) {
				// Optimisation: When the override is to keep the character unchanged,
				// we use an empty string in JSON. This reduces the data by 50%.
				return chr;
			}
			// @ts-ignore
			return toUpperMap[ chr ] || chr.toUpperCase();
		}

		/**
		 * @alias #getPrefixedDb
		 * @method
		 */
		toString(): string {
			return this.getPrefixedDb();
		}

		/**
		 * @alias #getPrefixedText
		 * @method
		 */
		toText(): string {
			return this.getPrefixedText();
		}


	}

	/**
	 * Private members
	 */

	let parse = function(title: string, defaultNamespace?: number) {
		Title.checkData();

		let namespace, m, id, i, fragment;

		let rUnicodeBidi = /[\u200E\u200F\u202A-\u202E]+/g,
			rWhitespace = /[ _\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/g,
			rUnderscoreTrim = /^_+|_+$/g,
			rSplit = /^(.+?)_*:_*(.*)$/,
			rInvalid = new RegExp(
				'[^' + " %!\"$&'()*,\\-./0-9:;=?@A-Z\\\\\\^_`a-z~+\\u0080-\\uFFFF" + ']' +
				// URL percent encoding sequences interfere with the ability
				// to round-trip titles -- you can't link to them consistently.
				'|%[\\dA-Fa-f]{2}' +
				// XML/HTML character references produce similar issues.
				'|&[\\dA-Za-z\u0080-\uFFFF]+;' +
				'|&#\\d+;' +
				'|&#x[\\dA-Fa-f]+;'
			);

		namespace = defaultNamespace === undefined ? NS_MAIN : defaultNamespace;

		title = title
			// Strip Unicode bidi override characters
			.replace( rUnicodeBidi, '' )
			// Normalise whitespace to underscores and remove duplicates
			.replace( rWhitespace, '_' )
			// Trim underscores
			.replace( rUnderscoreTrim, '' );

		// Process initial colon
		if ( title !== '' && title[ 0 ] === ':' ) {
			// Initial colon means main namespace instead of specified default
			namespace = NS_MAIN;
			title = title
				// Strip colon
				.slice( 1 )
				// Trim underscores
				.replace( rUnderscoreTrim, '' );
		}

		if ( title === '' ) {
			return false;
		}

		// Process namespace prefix (if any)
		m = title.match( rSplit );
		if ( m ) {
			id = getNsIdByName( m[ 1 ] );
			if ( id !== false ) {
				// Ordinary namespace
				namespace = id;
				title = m[ 2 ];
				// For Talk:X pages, make sure X has no "namespace" prefix
				if ( namespace === NS_TALK && ( m = title.match( rSplit ) ) ) {
					// Disallow titles like Talk:File:x (subject should roundtrip: talk:file:x -> file:x -> file_talk:x)
					if ( getNsIdByName( m[ 1 ] ) !== false ) {
						return false;
					}
				}
			}
		}

		// Process fragment
		i = title.indexOf( '#' );
		if ( i === -1 ) {
			fragment = null;
		} else {
			fragment = title
				// Get segment starting after the hash
				.slice( i + 1 )
				// Convert to text
				// NB: Must not be trimmed ("Example#_foo" is not the same as "Example#foo")
				.replace( /_/g, ' ' );
			title = title
				// Strip hash
				.slice( 0, i )
				// Trim underscores, again (strips "_" from "bar" in "Foo_bar_#quux")
				.replace( rUnderscoreTrim, '' );
		}

		// Reject illegal characters
		if ( rInvalid.test( title ) ) {
			return false;
		}

		// Disallow titles that browsers or servers might resolve as directory navigation
		if (
			title.indexOf( '.' ) !== -1 && (
				title === '.' || title === '..' ||
				title.indexOf( './' ) === 0 ||
				title.indexOf( '../' ) === 0 ||
				title.indexOf( '/./' ) !== -1 ||
				title.indexOf( '/../' ) !== -1 ||
				title.slice( -2 ) === '/.' ||
				title.slice( -3 ) === '/..'
			)
		) {
			return false;
		}

		// Disallow magic tilde sequence
		if ( title.indexOf( '~~~' ) !== -1 ) {
			return false;
		}

		// Disallow titles exceeding the TITLE_MAX_BYTES byte size limit (size of underlying database field)
		// Except for special pages, e.g. [[Special:Block/Long name]]
		// Note: The PHP implementation also asserts that even in NS_SPECIAL, the title should
		// be less than 512 bytes.
		if ( namespace !== NS_SPECIAL && byteLength( title ) > 255 ) {
			return false;
		}

		// Can't make a link to a namespace alone.
		if ( title === '' && namespace !== NS_MAIN ) {
			return false;
		}
		// Any remaining initial :s are illegal.
		if ( title[ 0 ] === ':' ) {
			return false;
		}
		return {
			namespace: namespace,
			title: title,
			fragment: fragment
		};

	};

	let getNamespacePrefix = function ( namespace: number ) {
		return namespace === NS_MAIN ?
			'' :
			( Title.idNameMap[ namespace ].replace( / /g, '_' ) + ':' );
	};

	let getNsIdByName = function ( ns: string ): false | number {
		let id;
		// Don't cast non-strings to strings, because null or undefined should not result in
		// returning the id of a potential namespace called "Null:" (e.g. on null.example.org/wiki)
		// Also, toLowerCase throws exception on null/undefined, because it is a String method.
		if ( typeof ns !== 'string' ) {
			return false;
		}

		id = Title.nameIdMap[ ns.toLowerCase() ];
		if ( id === undefined ) {
			return false;
		}
		return id;
	};

	// From https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.String.js
	let byteLength = function( str: string ) {
		return str
			.replace( /[\u0080-\u07FF\uD800-\uDFFF]/g, '**' )
			.replace( /[\u0800-\uD7FF\uE000-\uFFFF]/g, '***' )
			.length;
	};


	// XXX: put this in a separate file, like in mw.Title source code?
	let toUpperMap = {
		"ß": "",
		"ŉ": "",
		"ƀ": "",
		"ƚ": "",
		"ǅ": "",
		"ǆ": "ǅ",
		"ǈ": "",
		"ǉ": "ǈ",
		"ǋ": "",
		"ǌ": "ǋ",
		"ǰ": "",
		"ǲ": "",
		"ǳ": "ǲ",
		"ȼ": "",
		"ȿ": "",
		"ɀ": "",
		"ɂ": "",
		"ɇ": "",
		"ɉ": "",
		"ɋ": "",
		"ɍ": "",
		"ɏ": "",
		"ɐ": "",
		"ɑ": "",
		"ɒ": "",
		"ɜ": "",
		"ɡ": "",
		"ɥ": "",
		"ɦ": "",
		"ɪ": "",
		"ɫ": "",
		"ɬ": "",
		"ɱ": "",
		"ɽ": "",
		"ʂ": "",
		"ʇ": "",
		"ʉ": "",
		"ʌ": "",
		"ʝ": "",
		"ʞ": "",
		"ͅ": "",
		"ͱ": "",
		"ͳ": "",
		"ͷ": "",
		"ͻ": "",
		"ͼ": "",
		"ͽ": "",
		"ΐ": "",
		"ΰ": "",
		"ϗ": "",
		"ϲ": "Σ",
		"ϳ": "",
		"ϸ": "",
		"ϻ": "",
		"ӏ": "",
		"ӷ": "",
		"ӻ": "",
		"ӽ": "",
		"ӿ": "",
		"ԑ": "",
		"ԓ": "",
		"ԕ": "",
		"ԗ": "",
		"ԙ": "",
		"ԛ": "",
		"ԝ": "",
		"ԟ": "",
		"ԡ": "",
		"ԣ": "",
		"ԥ": "",
		"ԧ": "",
		"ԩ": "",
		"ԫ": "",
		"ԭ": "",
		"ԯ": "",
		"և": "",
		"ა": "",
		"ბ": "",
		"გ": "",
		"დ": "",
		"ე": "",
		"ვ": "",
		"ზ": "",
		"თ": "",
		"ი": "",
		"კ": "",
		"ლ": "",
		"მ": "",
		"ნ": "",
		"ო": "",
		"პ": "",
		"ჟ": "",
		"რ": "",
		"ს": "",
		"ტ": "",
		"უ": "",
		"ფ": "",
		"ქ": "",
		"ღ": "",
		"ყ": "",
		"შ": "",
		"ჩ": "",
		"ც": "",
		"ძ": "",
		"წ": "",
		"ჭ": "",
		"ხ": "",
		"ჯ": "",
		"ჰ": "",
		"ჱ": "",
		"ჲ": "",
		"ჳ": "",
		"ჴ": "",
		"ჵ": "",
		"ჶ": "",
		"ჷ": "",
		"ჸ": "",
		"ჹ": "",
		"ჺ": "",
		"ჽ": "",
		"ჾ": "",
		"ჿ": "",
		"ᏸ": "",
		"ᏹ": "",
		"ᏺ": "",
		"ᏻ": "",
		"ᏼ": "",
		"ᏽ": "",
		"ᲀ": "",
		"ᲁ": "",
		"ᲂ": "",
		"ᲃ": "",
		"ᲄ": "",
		"ᲅ": "",
		"ᲆ": "",
		"ᲇ": "",
		"ᲈ": "",
		"ᵹ": "",
		"ᵽ": "",
		"ᶎ": "",
		"ẖ": "",
		"ẗ": "",
		"ẘ": "",
		"ẙ": "",
		"ẚ": "",
		"ỻ": "",
		"ỽ": "",
		"ỿ": "",
		"ὐ": "",
		"ὒ": "",
		"ὔ": "",
		"ὖ": "",
		"ᾀ": "ᾈ",
		"ᾁ": "ᾉ",
		"ᾂ": "ᾊ",
		"ᾃ": "ᾋ",
		"ᾄ": "ᾌ",
		"ᾅ": "ᾍ",
		"ᾆ": "ᾎ",
		"ᾇ": "ᾏ",
		"ᾈ": "",
		"ᾉ": "",
		"ᾊ": "",
		"ᾋ": "",
		"ᾌ": "",
		"ᾍ": "",
		"ᾎ": "",
		"ᾏ": "",
		"ᾐ": "ᾘ",
		"ᾑ": "ᾙ",
		"ᾒ": "ᾚ",
		"ᾓ": "ᾛ",
		"ᾔ": "ᾜ",
		"ᾕ": "ᾝ",
		"ᾖ": "ᾞ",
		"ᾗ": "ᾟ",
		"ᾘ": "",
		"ᾙ": "",
		"ᾚ": "",
		"ᾛ": "",
		"ᾜ": "",
		"ᾝ": "",
		"ᾞ": "",
		"ᾟ": "",
		"ᾠ": "ᾨ",
		"ᾡ": "ᾩ",
		"ᾢ": "ᾪ",
		"ᾣ": "ᾫ",
		"ᾤ": "ᾬ",
		"ᾥ": "ᾭ",
		"ᾦ": "ᾮ",
		"ᾧ": "ᾯ",
		"ᾨ": "",
		"ᾩ": "",
		"ᾪ": "",
		"ᾫ": "",
		"ᾬ": "",
		"ᾭ": "",
		"ᾮ": "",
		"ᾯ": "",
		"ᾲ": "",
		"ᾳ": "ᾼ",
		"ᾴ": "",
		"ᾶ": "",
		"ᾷ": "",
		"ᾼ": "",
		"ῂ": "",
		"ῃ": "ῌ",
		"ῄ": "",
		"ῆ": "",
		"ῇ": "",
		"ῌ": "",
		"ῒ": "",
		"ΐ": "",
		"ῖ": "",
		"ῗ": "",
		"ῢ": "",
		"ΰ": "",
		"ῤ": "",
		"ῦ": "",
		"ῧ": "",
		"ῲ": "",
		"ῳ": "ῼ",
		"ῴ": "",
		"ῶ": "",
		"ῷ": "",
		"ῼ": "",
		"ⅎ": "",
		"ⅰ": "",
		"ⅱ": "",
		"ⅲ": "",
		"ⅳ": "",
		"ⅴ": "",
		"ⅵ": "",
		"ⅶ": "",
		"ⅷ": "",
		"ⅸ": "",
		"ⅹ": "",
		"ⅺ": "",
		"ⅻ": "",
		"ⅼ": "",
		"ⅽ": "",
		"ⅾ": "",
		"ⅿ": "",
		"ↄ": "",
		"ⓐ": "",
		"ⓑ": "",
		"ⓒ": "",
		"ⓓ": "",
		"ⓔ": "",
		"ⓕ": "",
		"ⓖ": "",
		"ⓗ": "",
		"ⓘ": "",
		"ⓙ": "",
		"ⓚ": "",
		"ⓛ": "",
		"ⓜ": "",
		"ⓝ": "",
		"ⓞ": "",
		"ⓟ": "",
		"ⓠ": "",
		"ⓡ": "",
		"ⓢ": "",
		"ⓣ": "",
		"ⓤ": "",
		"ⓥ": "",
		"ⓦ": "",
		"ⓧ": "",
		"ⓨ": "",
		"ⓩ": "",
		"ⰰ": "",
		"ⰱ": "",
		"ⰲ": "",
		"ⰳ": "",
		"ⰴ": "",
		"ⰵ": "",
		"ⰶ": "",
		"ⰷ": "",
		"ⰸ": "",
		"ⰹ": "",
		"ⰺ": "",
		"ⰻ": "",
		"ⰼ": "",
		"ⰽ": "",
		"ⰾ": "",
		"ⰿ": "",
		"ⱀ": "",
		"ⱁ": "",
		"ⱂ": "",
		"ⱃ": "",
		"ⱄ": "",
		"ⱅ": "",
		"ⱆ": "",
		"ⱇ": "",
		"ⱈ": "",
		"ⱉ": "",
		"ⱊ": "",
		"ⱋ": "",
		"ⱌ": "",
		"ⱍ": "",
		"ⱎ": "",
		"ⱏ": "",
		"ⱐ": "",
		"ⱑ": "",
		"ⱒ": "",
		"ⱓ": "",
		"ⱔ": "",
		"ⱕ": "",
		"ⱖ": "",
		"ⱗ": "",
		"ⱘ": "",
		"ⱙ": "",
		"ⱚ": "",
		"ⱛ": "",
		"ⱜ": "",
		"ⱝ": "",
		"ⱞ": "",
		"ⱡ": "",
		"ⱥ": "",
		"ⱦ": "",
		"ⱨ": "",
		"ⱪ": "",
		"ⱬ": "",
		"ⱳ": "",
		"ⱶ": "",
		"ⲁ": "",
		"ⲃ": "",
		"ⲅ": "",
		"ⲇ": "",
		"ⲉ": "",
		"ⲋ": "",
		"ⲍ": "",
		"ⲏ": "",
		"ⲑ": "",
		"ⲓ": "",
		"ⲕ": "",
		"ⲗ": "",
		"ⲙ": "",
		"ⲛ": "",
		"ⲝ": "",
		"ⲟ": "",
		"ⲡ": "",
		"ⲣ": "",
		"ⲥ": "",
		"ⲧ": "",
		"ⲩ": "",
		"ⲫ": "",
		"ⲭ": "",
		"ⲯ": "",
		"ⲱ": "",
		"ⲳ": "",
		"ⲵ": "",
		"ⲷ": "",
		"ⲹ": "",
		"ⲻ": "",
		"ⲽ": "",
		"ⲿ": "",
		"ⳁ": "",
		"ⳃ": "",
		"ⳅ": "",
		"ⳇ": "",
		"ⳉ": "",
		"ⳋ": "",
		"ⳍ": "",
		"ⳏ": "",
		"ⳑ": "",
		"ⳓ": "",
		"ⳕ": "",
		"ⳗ": "",
		"ⳙ": "",
		"ⳛ": "",
		"ⳝ": "",
		"ⳟ": "",
		"ⳡ": "",
		"ⳣ": "",
		"ⳬ": "",
		"ⳮ": "",
		"ⳳ": "",
		"ⴀ": "",
		"ⴁ": "",
		"ⴂ": "",
		"ⴃ": "",
		"ⴄ": "",
		"ⴅ": "",
		"ⴆ": "",
		"ⴇ": "",
		"ⴈ": "",
		"ⴉ": "",
		"ⴊ": "",
		"ⴋ": "",
		"ⴌ": "",
		"ⴍ": "",
		"ⴎ": "",
		"ⴏ": "",
		"ⴐ": "",
		"ⴑ": "",
		"ⴒ": "",
		"ⴓ": "",
		"ⴔ": "",
		"ⴕ": "",
		"ⴖ": "",
		"ⴗ": "",
		"ⴘ": "",
		"ⴙ": "",
		"ⴚ": "",
		"ⴛ": "",
		"ⴜ": "",
		"ⴝ": "",
		"ⴞ": "",
		"ⴟ": "",
		"ⴠ": "",
		"ⴡ": "",
		"ⴢ": "",
		"ⴣ": "",
		"ⴤ": "",
		"ⴥ": "",
		"ⴧ": "",
		"ⴭ": "",
		"ꙁ": "",
		"ꙃ": "",
		"ꙅ": "",
		"ꙇ": "",
		"ꙉ": "",
		"ꙋ": "",
		"ꙍ": "",
		"ꙏ": "",
		"ꙑ": "",
		"ꙓ": "",
		"ꙕ": "",
		"ꙗ": "",
		"ꙙ": "",
		"ꙛ": "",
		"ꙝ": "",
		"ꙟ": "",
		"ꙡ": "",
		"ꙣ": "",
		"ꙥ": "",
		"ꙧ": "",
		"ꙩ": "",
		"ꙫ": "",
		"ꙭ": "",
		"ꚁ": "",
		"ꚃ": "",
		"ꚅ": "",
		"ꚇ": "",
		"ꚉ": "",
		"ꚋ": "",
		"ꚍ": "",
		"ꚏ": "",
		"ꚑ": "",
		"ꚓ": "",
		"ꚕ": "",
		"ꚗ": "",
		"ꚙ": "",
		"ꚛ": "",
		"ꜣ": "",
		"ꜥ": "",
		"ꜧ": "",
		"ꜩ": "",
		"ꜫ": "",
		"ꜭ": "",
		"ꜯ": "",
		"ꜳ": "",
		"ꜵ": "",
		"ꜷ": "",
		"ꜹ": "",
		"ꜻ": "",
		"ꜽ": "",
		"ꜿ": "",
		"ꝁ": "",
		"ꝃ": "",
		"ꝅ": "",
		"ꝇ": "",
		"ꝉ": "",
		"ꝋ": "",
		"ꝍ": "",
		"ꝏ": "",
		"ꝑ": "",
		"ꝓ": "",
		"ꝕ": "",
		"ꝗ": "",
		"ꝙ": "",
		"ꝛ": "",
		"ꝝ": "",
		"ꝟ": "",
		"ꝡ": "",
		"ꝣ": "",
		"ꝥ": "",
		"ꝧ": "",
		"ꝩ": "",
		"ꝫ": "",
		"ꝭ": "",
		"ꝯ": "",
		"ꝺ": "",
		"ꝼ": "",
		"ꝿ": "",
		"ꞁ": "",
		"ꞃ": "",
		"ꞅ": "",
		"ꞇ": "",
		"ꞌ": "",
		"ꞑ": "",
		"ꞓ": "",
		"ꞔ": "",
		"ꞗ": "",
		"ꞙ": "",
		"ꞛ": "",
		"ꞝ": "",
		"ꞟ": "",
		"ꞡ": "",
		"ꞣ": "",
		"ꞥ": "",
		"ꞧ": "",
		"ꞩ": "",
		"ꞵ": "",
		"ꞷ": "",
		"ꞹ": "",
		"ꞻ": "",
		"ꞽ": "",
		"ꞿ": "",
		"ꟃ": "",
		"ꭓ": "",
		"ꭰ": "",
		"ꭱ": "",
		"ꭲ": "",
		"ꭳ": "",
		"ꭴ": "",
		"ꭵ": "",
		"ꭶ": "",
		"ꭷ": "",
		"ꭸ": "",
		"ꭹ": "",
		"ꭺ": "",
		"ꭻ": "",
		"ꭼ": "",
		"ꭽ": "",
		"ꭾ": "",
		"ꭿ": "",
		"ꮀ": "",
		"ꮁ": "",
		"ꮂ": "",
		"ꮃ": "",
		"ꮄ": "",
		"ꮅ": "",
		"ꮆ": "",
		"ꮇ": "",
		"ꮈ": "",
		"ꮉ": "",
		"ꮊ": "",
		"ꮋ": "",
		"ꮌ": "",
		"ꮍ": "",
		"ꮎ": "",
		"ꮏ": "",
		"ꮐ": "",
		"ꮑ": "",
		"ꮒ": "",
		"ꮓ": "",
		"ꮔ": "",
		"ꮕ": "",
		"ꮖ": "",
		"ꮗ": "",
		"ꮘ": "",
		"ꮙ": "",
		"ꮚ": "",
		"ꮛ": "",
		"ꮜ": "",
		"ꮝ": "",
		"ꮞ": "",
		"ꮟ": "",
		"ꮠ": "",
		"ꮡ": "",
		"ꮢ": "",
		"ꮣ": "",
		"ꮤ": "",
		"ꮥ": "",
		"ꮦ": "",
		"ꮧ": "",
		"ꮨ": "",
		"ꮩ": "",
		"ꮪ": "",
		"ꮫ": "",
		"ꮬ": "",
		"ꮭ": "",
		"ꮮ": "",
		"ꮯ": "",
		"ꮰ": "",
		"ꮱ": "",
		"ꮲ": "",
		"ꮳ": "",
		"ꮴ": "",
		"ꮵ": "",
		"ꮶ": "",
		"ꮷ": "",
		"ꮸ": "",
		"ꮹ": "",
		"ꮺ": "",
		"ꮻ": "",
		"ꮼ": "",
		"ꮽ": "",
		"ꮾ": "",
		"ꮿ": "",
		"ﬀ": "",
		"ﬁ": "",
		"ﬂ": "",
		"ﬃ": "",
		"ﬄ": "",
		"ﬅ": "",
		"ﬆ": "",
		"ﬓ": "",
		"ﬔ": "",
		"ﬕ": "",
		"ﬖ": "",
		"ﬗ": "",
		"𐑎": "",
		"𐑏": "",
		"𐓘": "",
		"𐓙": "",
		"𐓚": "",
		"𐓛": "",
		"𐓜": "",
		"𐓝": "",
		"𐓞": "",
		"𐓟": "",
		"𐓠": "",
		"𐓡": "",
		"𐓢": "",
		"𐓣": "",
		"𐓤": "",
		"𐓥": "",
		"𐓦": "",
		"𐓧": "",
		"𐓨": "",
		"𐓩": "",
		"𐓪": "",
		"𐓫": "",
		"𐓬": "",
		"𐓭": "",
		"𐓮": "",
		"𐓯": "",
		"𐓰": "",
		"𐓱": "",
		"𐓲": "",
		"𐓳": "",
		"𐓴": "",
		"𐓵": "",
		"𐓶": "",
		"𐓷": "",
		"𐓸": "",
		"𐓹": "",
		"𐓺": "",
		"𐓻": "",
		"𐳀": "",
		"𐳁": "",
		"𐳂": "",
		"𐳃": "",
		"𐳄": "",
		"𐳅": "",
		"𐳆": "",
		"𐳇": "",
		"𐳈": "",
		"𐳉": "",
		"𐳊": "",
		"𐳋": "",
		"𐳌": "",
		"𐳍": "",
		"𐳎": "",
		"𐳏": "",
		"𐳐": "",
		"𐳑": "",
		"𐳒": "",
		"𐳓": "",
		"𐳔": "",
		"𐳕": "",
		"𐳖": "",
		"𐳗": "",
		"𐳘": "",
		"𐳙": "",
		"𐳚": "",
		"𐳛": "",
		"𐳜": "",
		"𐳝": "",
		"𐳞": "",
		"𐳟": "",
		"𐳠": "",
		"𐳡": "",
		"𐳢": "",
		"𐳣": "",
		"𐳤": "",
		"𐳥": "",
		"𐳦": "",
		"𐳧": "",
		"𐳨": "",
		"𐳩": "",
		"𐳪": "",
		"𐳫": "",
		"𐳬": "",
		"𐳭": "",
		"𐳮": "",
		"𐳯": "",
		"𐳰": "",
		"𐳱": "",
		"𐳲": "",
		"𑣀": "",
		"𑣁": "",
		"𑣂": "",
		"𑣃": "",
		"𑣄": "",
		"𑣅": "",
		"𑣆": "",
		"𑣇": "",
		"𑣈": "",
		"𑣉": "",
		"𑣊": "",
		"𑣋": "",
		"𑣌": "",
		"𑣍": "",
		"𑣎": "",
		"𑣏": "",
		"𑣐": "",
		"𑣑": "",
		"𑣒": "",
		"𑣓": "",
		"𑣔": "",
		"𑣕": "",
		"𑣖": "",
		"𑣗": "",
		"𑣘": "",
		"𑣙": "",
		"𑣚": "",
		"𑣛": "",
		"𑣜": "",
		"𑣝": "",
		"𑣞": "",
		"𑣟": "",
		"𖹠": "",
		"𖹡": "",
		"𖹢": "",
		"𖹣": "",
		"𖹤": "",
		"𖹥": "",
		"𖹦": "",
		"𖹧": "",
		"𖹨": "",
		"𖹩": "",
		"𖹪": "",
		"𖹫": "",
		"𖹬": "",
		"𖹭": "",
		"𖹮": "",
		"𖹯": "",
		"𖹰": "",
		"𖹱": "",
		"𖹲": "",
		"𖹳": "",
		"𖹴": "",
		"𖹵": "",
		"𖹶": "",
		"𖹷": "",
		"𖹸": "",
		"𖹹": "",
		"𖹺": "",
		"𖹻": "",
		"𖹼": "",
		"𖹽": "",
		"𖹾": "",
		"𖹿": "",
		"𞤢": "",
		"𞤣": "",
		"𞤤": "",
		"𞤥": "",
		"𞤦": "",
		"𞤧": "",
		"𞤨": "",
		"𞤩": "",
		"𞤪": "",
		"𞤫": "",
		"𞤬": "",
		"𞤭": "",
		"𞤮": "",
		"𞤯": "",
		"𞤰": "",
		"𞤱": "",
		"𞤲": "",
		"𞤳": "",
		"𞤴": "",
		"𞤵": "",
		"𞤶": "",
		"𞤷": "",
		"𞤸": "",
		"𞤹": "",
		"𞤺": "",
		"𞤻": "",
		"𞤼": "",
		"𞤽": "",
		"𞤾": "",
		"𞤿": "",
		"𞥀": "",
		"𞥁": "",
		"𞥂": "",
		"𞥃": ""
	};

	return Title as MwnTitleStatic;

}
