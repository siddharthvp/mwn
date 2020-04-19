/**
 *
 * This class is a substantial copy of mw.Title in the MediaWiki on-site
 * JS interface.
 *
 * Adapted from <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.Title/>
 * (GNU GPL v2)
 *
 */

const request = require('request');

var NS_MAIN = 0;
var NS_TALK = 1;
var NS_SPECIAL = -1;

class Title {

	static getNamespaceData(apiUrl) {
		return new Promise((resolve, reject) => {
			request({
				method: 'GET',
				uri: apiUrl,
				headers: {
					'User-Agent': 'mwn'
				},
				qs: {
					"action": "query",
					"format": "json",
					"meta": "siteinfo",
					"formatversion": "2",
					"siprop": "general|namespacealiases|namespaces"
				},
				timeout: 120000,
				jar: true,
				time: true,
				json: true
			}, function(error, response, json) {
				if (error) {
					return reject(error);
				}
				Title.processNamespaceData(json);
				resolve();
			});

		});
	}

	static processNamespaceData(json) {
		// Analog of mw.config.get('wgFormattedNamespaces')
		Title.idNameMap = {};

		// Analag of mw.config.get('wgNamespaceIds')
		Title.nameIdMap = {};

		Object.values(json.query.namespaces).forEach(ns => {
			Title.idNameMap[ns.id] = ns.name;
			Title.nameIdMap[Title.namespaceNorm(ns.name)] = ns.id;
			Title.nameIdMap[Title.namespaceNorm(ns.canonical)] = ns.id;
		});
		json.query.namespacealiases.forEach(ns => {
			Title.nameIdMap[Title.namespaceNorm(ns.alias)] = ns.id;
		});

		// Analog of mw.config.get('wgLegalTitleChars')
		Title.legaltitlechars = json.query.general.legaltitlechars;

		// Analog of mw.config.get('wgCaseSensitiveNamespaces')
		Title.caseSensitiveNamespaces = Object.values(json.query.namespaces)
			.filter(ns => ns.case === 'case-sensitive')
			.map(ns => ns.id);
	}

	static namespaceNorm(ns) {
		return (ns || '').toLowerCase().replace(/ /g, '_');
	}

	constructor( title, namespace ) {
		var parsed = parse( title, namespace );
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
	 *
	 * @return {number}
	 */
	getNamespaceId() {
		return this.namespace;
	}

	/**
	 * Get the namespace prefix (in the content language)
	 *
	 * Example: "File:" for "File:Example_image.svg".
	 * In #NS_MAIN this is '', otherwise namespace name plus ':'
	 *
	 * @return {string}
	 */
	getNamespacePrefix() {
		return getNamespacePrefix( this.namespace );
	}

	/**
	 * Get the main page name
	 *
	 * Example: "Example_image.svg" for "File:Example_image.svg".
	 *
	 * @return {string}
	 */
	getMain() {
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
	 *
	 * Example: "Example image.svg" for "File:Example_image.svg".
	 *
	 * @return {string}
	 */
	getMainText() {
		return this.getMain().replace( /_/g, ' ' );
	}

	/**
	 * Get the full page name
	 *
	 * Example: "File:Example_image.svg".
	 * Most useful for API calls, anything that must identify the "title".
	 *
	 * @return {string}
	 */
	getPrefixedDb() {
		return this.getNamespacePrefix() + this.getMain();
	}

	/**
	 * Get the full page name (transformed by #text)
	 *
	 * Example: "File:Example image.svg" for "File:Example_image.svg".
	 *
	 * @return {string}
	 */
	getPrefixedText() {
		return ( this.getPrefixedDb() ).replace( /_/g, ' ' );
	}

	/**
	 * Get the fragment (if any).
	 *
	 * Note that this method (by design) does not include the hash character and
	 * the value is not url encoded.
	 *
	 * @return {string|null}
	 */
	getFragment() {
		return this.fragment;
	}

	/**
	 * Check if the title is in a talk namespace
	 *
	 * @return {boolean} The title is in a talk namespace
	 */
	isTalkPage() {
		return Title.isTalkNamespace( this.getNamespaceId() );
	}

	/**
	 * Get the title for the associated talk page
	 *
	 * @return {mw.Title|null} The title for the associated talk page, null if not available
	 */
	getTalkPage() {
		if ( !this.canHaveTalkPage() ) {
			return null;
		}
		return this.isTalkPage() ?
			this :
			Title.makeTitle( this.getNamespaceId() + 1, this.getMainText() );
	}

	/**
	 * Get the title for the subject page of a talk page
	 *
	 * @return {mw.Title|null} The title for the subject page of a talk page, null if not available
	 */
	getSubjectPage() {
		return this.isTalkPage() ?
			Title.makeTitle( this.getNamespaceId() - 1, this.getMainText() ) :
			this;
	}

	/**
	 * Check the the title can have an associated talk page
	 *
	 * @return {boolean} The title can have an associated talk page
	 */
	canHaveTalkPage() {
		return this.getNamespaceId() >= NS_MAIN;
	}

	/**
	 * Get the extension of the page name (if any)
	 *
	 * @return {string|null} Name extension or null if there is none
	 */
	getExtension() {
		var lastDot = this.title.lastIndexOf( '.' );
		if ( lastDot === -1 ) {
			return null;
		}
		return this.title.slice( lastDot + 1 ) || null;
	}

	/**
	 * Shortcut for appendable string to form the main page name.
	 *
	 * Returns a string like ".json", or "" if no extension.
	 *
	 * @return {string}
	 */
	getDotExtension() {
		var ext = this.getExtension();
		return ext === null ? '' : '.' + ext;
	}

}

/**
 * Private members
 */

Title.checkData = function() {
	if (!Title.nameIdMap || !Title.idNameMap || !Title.legaltitlechars) {
		throw new Error('namespace data unavailable: run title.getNamespaceData() first');
	}
};

var parse = function(title, defaultNamespace) {
	Title.checkData();

	var namespace, m, id, i, fragment;

	var rUnicodeBidi = /[\u200E\u200F\u202A-\u202E]+/g,
		rWhitespace = /[ _\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/g,
		rUnderscoreTrim = /^_+|_+$/g,
		rSplit = /^(.+?)_*:_*(.*)$/,
		rInvalid = new RegExp(
			'[^' + Title.legaltitlechars + ']' +
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

var getNamespacePrefix = function ( namespace ) {
	return namespace === NS_MAIN ?
		'' :
		( Title.idNameMap[ namespace ].replace( / /g, '_' ) + ':' );
};

var getNsIdByName = function ( ns ) {
	var id;
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
var byteLength = function( str ) {
	return str
		.replace( /[\u0080-\u07FF\uD800-\uDFFF]/g, '**' )
		.replace( /[\u0800-\uD7FF\uE000-\uFFFF]/g, '***' )
		.length;
};

/**
 * Static members
 */

/**
 * Constructor for Title objects with a null return instead of an exception for invalid titles.
 *
 * Note that `namespace` is the **default** namespace only, and can be overridden by a namespace
 * prefix in `title`. If you do not want this behavior, use #makeTitle. See #constructor for
 * details.
 *
 * @static
 * @param {string} title
 * @param {number} [namespace=NS_MAIN] Default namespace
 * @return {mw.Title|null} A valid Title object or null if the title is invalid
 */
Title.newFromText = function ( title, namespace ) {
	var t, parsed = parse( title, namespace );
	if ( !parsed ) {
		return null;
	}
	t = Object.create( Title.prototype );
	t.namespace = parsed.namespace;
	t.title = parsed.title;
	t.fragment = parsed.fragment;
	return t;
};


/**
 * Constructor for Title objects with predefined namespace.
 *
 * Unlike #newFromText or #constructor, this function doesn't allow the given `namespace` to be
 * overridden by a namespace prefix in `title`. See #constructor for details about this behavior.
 *
 * The single exception to this is when `namespace` is 0, indicating the main namespace. The
 * function behaves like #newFromText in that case.
 *
 * @static
 * @param {number} namespace Namespace to use for the title
 * @param {string} title
 * @return {mw.Title|null} A valid Title object or null if the title is invalid
 */
Title.makeTitle = function ( namespace, title ) {
	return Title.newFromText( getNamespacePrefix( namespace ) + title );
};

/**
 * Check if a given namespace is a talk namespace
 *
 * @param {number} namespaceId Namespace ID
 * @return {boolean} Namespace is a talk namespace
 */
Title.isTalkNamespace = function ( namespaceId ) {
	return !!( namespaceId > NS_MAIN && namespaceId % 2 );
};

/**
 * @alias #getPrefixedDb
 * @method
 */
Title.prototype.toString = Title.prototype.getPrefixedDb;

/**
 * @alias #getPrefixedText
 * @method
 */
Title.prototype.toText = Title.prototype.getPrefixedText;

/**
 * PHP's strtoupper differs from String.toUpperCase in a number of cases (T147646).
 *
 * @param {string} chr Unicode character
 * @return {string} Unicode character, in upper case, according to the same rules as in PHP
 */
Title.phpCharToUpper = function ( chr ) {
	if ( toUpperMap[ chr ] === '' ) {
		// Optimisation: When the override is to keep the character unchanged,
		// we use an empty string in JSON. This reduces the data by 50%.
		return chr;
	}
	return toUpperMap[ chr ] || chr.toUpperCase();
};

// XXX: put this in a separate file, like in mw.Title source code?
var toUpperMap = {
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


module.exports = Title;