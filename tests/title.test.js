/**
 * Tests adapted from <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/tests/qunit/suites/resources/mediawiki/mediawiki.Title.test.js>
 *
 */

const { mwn, assert, populateTitleData } = require('./base/test_base');

const bot = new mwn();
const Title = bot.Title;
populateTitleData(Title);

describe('title', function () {
	var repeat = function (input, multiplier) {
			return new Array(multiplier + 1).join(input);
		},
		// See also TitleTest.php#testSecureAndSplit
		cases = {
			valid: [
				'Sandbox',
				'A "B"',
				"A 'B'",
				'.com',
				'~',
				'"',
				"'",
				'Talk:Sandbox',
				'Talk:Foo:Sandbox',
				'File:Example.svg',
				'File_talk:Example.svg',
				'Foo/.../Sandbox',
				'Sandbox/...',
				'A~~',
				':A',
				// Length is 256 total, but only title part matters
				'Category:' + repeat('x', 248),
				repeat('x', 252),
			],
			invalid: [
				'',
				':',
				'__  __',
				'  __  ',
				// Bad characters forbidden regardless of wgLegalTitleChars
				'A [ B',
				'A ] B',
				'A { B',
				'A } B',
				'A < B',
				'A > B',
				'A | B',
				'A \t B',
				'A \n B',
				// URL encoding
				'A%20B',
				'A%23B',
				'A%2523B',
				// XML/HTML character entity references
				// Note: The ones with # are commented out as those are interpreted as fragment and
				// as such end up being valid.
				'A &eacute; B',
				// 'A &#233; B',
				// 'A &#x00E9; B',
				// Subject of NS_TALK does not roundtrip to NS_MAIN
				'Talk:File:Example.svg',
				// Directory navigation
				'.',
				'..',
				'./Sandbox',
				'../Sandbox',
				'Foo/./Sandbox',
				'Foo/../Sandbox',
				'Sandbox/.',
				'Sandbox/..',
				// Tilde
				'A ~~~ Name',
				'A ~~~~ Signature',
				'A ~~~~~ Timestamp',
				repeat('x', 256),
				// Extension separation is a js invention, for length
				// purposes it is part of the title
				repeat('x', 252) + '.json',
				// Namespace prefix without actual title
				'Talk:',
				'Category: ',
				'Category: #bar',
			],
		};

	it('constructor', function () {
		var i, title;
		for (i = 0; i < cases.valid.length; i++) {
			title = new Title(cases.valid[i]);
		}
		for (i = 0; i < cases.invalid.length; i++) {
			title = cases.invalid[i];
			// eslint-disable-next-line no-loop-func
			assert.throws(function () {
				return new Title(title);
			}, cases.invalid[i]);
		}
	});

	it('newFromText', function () {
		var i;
		for (i = 0; i < cases.valid.length; i++) {
			assert.strictEqual(typeof Title.newFromText(cases.valid[i]), 'object', cases.valid[i]);
		}
		for (i = 0; i < cases.invalid.length; i++) {
			assert.strictEqual(Title.newFromText(cases.invalid[i]), null, cases.invalid[i]);
		}
	});

	it('makeTitle', function () {
		var cases,
			i,
			title,
			expected,
			NS_MAIN = 0,
			NS_TALK = 1,
			NS_TEMPLATE = 10;

		cases = [
			[NS_TEMPLATE, 'Foo', 'Template:Foo'],
			[NS_TEMPLATE, 'Category:Foo', 'Template:Category:Foo'],
			[NS_TEMPLATE, 'Template:Foo', 'Template:Template:Foo'],
			[NS_TALK, 'Help:Foo', null],
			[NS_TEMPLATE, '<', null],
			[NS_MAIN, 'Help:Foo', 'Help:Foo'],
		];

		for (i = 0; i < cases.length; i++) {
			title = Title.makeTitle(cases[i][0], cases[i][1]);
			expected = cases[i][2];
			if (expected === null) {
				assert.strictEqual(title, expected);
			} else {
				assert.strictEqual(title.getPrefixedText(), expected);
			}
		}
	});

	it('Basic parsing', function () {
		var title;
		title = new Title('File:Foo_bar.JPG');

		assert.strictEqual(title.getNamespaceId(), 6);
		assert.strictEqual(title.getNamespacePrefix(), 'File:');
		// assert.strictEqual( title.getName(), 'Foo_bar' );
		// assert.strictEqual( title.getNameText(), 'Foo bar' );
		assert.strictEqual(title.getExtension(), 'JPG');
		assert.strictEqual(title.getDotExtension(), '.JPG');
		assert.strictEqual(title.getMain(), 'Foo_bar.JPG');
		assert.strictEqual(title.getMainText(), 'Foo bar.JPG');
		assert.strictEqual(title.getPrefixedDb(), 'File:Foo_bar.JPG');
		assert.strictEqual(title.getPrefixedText(), 'File:Foo bar.JPG');

		title = new Title('Foo#bar');
		assert.strictEqual(title.getPrefixedText(), 'Foo');
		assert.strictEqual(title.getFragment(), 'bar');

		title = new Title('.foo');
		assert.strictEqual(title.getPrefixedText(), '.foo');
		// assert.strictEqual( title.getName(), '' );
		// assert.strictEqual( title.getNameText(), '' );
		assert.strictEqual(title.getExtension(), 'foo');
		assert.strictEqual(title.getDotExtension(), '.foo');
		assert.strictEqual(title.getMain(), '.foo');
		assert.strictEqual(title.getMainText(), '.foo');
		assert.strictEqual(title.getPrefixedDb(), '.foo');
		assert.strictEqual(title.getPrefixedText(), '.foo');
	});

	it('Transformation', function () {
		var title;

		// title = new Title( 'File:quux pif.jpg' );
		// assert.strictEqual( title.getNameText(), 'Quux pif', 'First character of title' );

		// title = new Title( 'File:Glarg_foo_glang.jpg' );
		// assert.strictEqual( title.getNameText(), 'Glarg foo glang', 'Underscores' );

		title = new Title('User:ABC.DEF');
		assert.strictEqual(title.toText(), 'User:ABC.DEF', 'Round trip text');
		assert.strictEqual(title.getNamespaceId(), 2, 'Parse canonical namespace prefix');

		title = new Title('Image:quux pix.jpg');
		assert.strictEqual(title.getNamespacePrefix(), 'File:', 'Transform alias to canonical namespace');

		title = new Title('uSEr:hAshAr');
		assert.strictEqual(title.toText(), 'User:HAshAr');
		assert.strictEqual(title.getNamespaceId(), 2, 'Case-insensitive namespace prefix');

		title = new Title(
			'Foo \u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000 bar'
		);
		assert.strictEqual(
			title.getMain(),
			'Foo_bar',
			'Merge multiple types of whitespace/underscores into a single underscore'
		);

		title = new Title('Foo\u200E\u200F\u202A\u202B\u202C\u202D\u202Ebar');
		assert.strictEqual(title.getMain(), 'Foobar', 'Strip Unicode bidi override characters');

		// Regression test: Previously it would only detect an extension if there is no space after it
		title = new Title('Example.js  ');
		assert.strictEqual(title.getExtension(), 'js', 'Space after an extension is stripped');

		title = new Title('Example#foo');
		assert.strictEqual(title.getFragment(), 'foo', 'Fragment');

		title = new Title('Example#_foo_bar baz_');
		assert.strictEqual(title.getFragment(), ' foo bar baz', 'Fragment');
	});

	it('Namespace detection and conversion', function () {
		var title;

		title = new Title('File:User:Example');
		assert.strictEqual(
			title.getNamespaceId(),
			6,
			'Titles can contain namespace prefixes, which are otherwise ignored'
		);

		title = new Title('Example', 6);
		assert.strictEqual(title.getNamespaceId(), 6, 'Default namespace passed is used');

		title = new Title('User:Example', 6);
		assert.strictEqual(title.getNamespaceId(), 2, 'Included namespace prefix overrides the given default');

		title = new Title(':Example', 6);
		assert.strictEqual(title.getNamespaceId(), 0, 'Colon forces main namespace');

		title = new Title('something.PDF', 6);
		assert.strictEqual(title.toString(), 'File:Something.PDF');

		title = new Title('NeilK', 3);
		assert.strictEqual(title.toString(), 'User_talk:NeilK');
		assert.strictEqual(title.toText(), 'User talk:NeilK');

		title = new Title('Frobisher', 100);
		assert.strictEqual(title.toString(), 'Penguins:Frobisher');

		title = new Title('antarctic_waterfowl:flightless_yet_cute.jpg');
		assert.strictEqual(title.toString(), 'Penguins:Flightless_yet_cute.jpg');

		title = new Title('Penguins:flightless_yet_cute.jpg');
		assert.strictEqual(title.toString(), 'Penguins:Flightless_yet_cute.jpg');
	});

	it('isTalkPage/getTalkPage/getSubjectPage', function () {
		var title;

		title = new Title('User:Foo');
		assert.strictEqual(title.isTalkPage(), false, 'Non-talk page detected as such');
		assert.strictEqual(
			title.getSubjectPage().getPrefixedText(),
			'User:Foo',
			'getSubjectPage on a subject page is a no-op'
		);

		title = title.getTalkPage();
		assert.strictEqual(title.getPrefixedText(), 'User talk:Foo', 'getTalkPage creates correct title');
		assert.strictEqual(
			title.getTalkPage().getPrefixedText(),
			'User talk:Foo',
			'getTalkPage on a talk page is a no-op'
		);
		assert.strictEqual(title.isTalkPage(), true, 'Talk page is detected as such');

		title = title.getSubjectPage();
		assert.strictEqual(title.getPrefixedText(), 'User:Foo', 'getSubjectPage creates correct title');

		title = new Title('Special:AllPages');
		assert.strictEqual(title.isTalkPage(), false, 'Special page is not a talk page');
		assert.strictEqual(title.getTalkPage(), null, 'getTalkPage not valid for this namespace');
		assert.strictEqual(
			title.getSubjectPage().getPrefixedText(),
			'Special:AllPages',
			'getSubjectPage is self for special pages'
		);

		title = new Title('Category:Project:Maintenance');
		assert.strictEqual(
			title.getTalkPage().getPrefixedText(),
			'Category talk:Project:Maintenance',
			'getTalkPage is not confused by colon in main text'
		);
		title = new Title('Category talk:Project:Maintenance');
		assert.strictEqual(
			title.getSubjectPage().getPrefixedText(),
			'Category:Project:Maintenance',
			'getSubjectPage is not confused by colon in main text'
		);

		title = new Title('Foo#Caption');
		assert.strictEqual(title.getFragment(), 'Caption', 'Subject page has a fragment');
		title = title.getTalkPage();
		assert.strictEqual(title.getPrefixedText(), 'Talk:Foo', 'getTalkPage creates correct title');
		assert.strictEqual(title.getFragment(), null, 'getTalkPage does not copy the fragment');
	});

	it('Throw error on invalid title', function () {
		assert.throws(function () {
			return new Title('');
		}, 'Throw error on empty string');
	});

	it('Case-sensivity', function () {
		var title;

		// Default config
		Title.caseSensitiveNamespaces = [];

		title = new Title('article');
		assert.strictEqual(
			title.toString(),
			'Article',
			'Default config: No sensitive namespaces by default. First-letter becomes uppercase'
		);

		title = new Title('ß');
		assert.strictEqual(title.toString(), 'ß', 'Uppercasing matches PHP behaviour (ß -> ß, not SS)');

		title = new Title('ǆ (digraph)');
		assert.strictEqual(title.toString(), 'ǅ_(digraph)', 'Uppercasing matches PHP behaviour (ǆ -> ǅ, not Ǆ)');

		// $wgCapitalLinks = false;
		Title.caseSensitiveNamespaces = [0, -2, 1, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15];

		title = new Title('article');
		assert.strictEqual(
			title.toString(),
			'article',
			'$wgCapitalLinks=false: Article namespace is sensitive, first-letter case stays lowercase'
		);

		title = new Title('john', 2);
		assert.strictEqual(
			title.toString(),
			'User:John',
			'$wgCapitalLinks=false: User namespace is insensitive, first-letter becomes uppercase'
		);
	});

	it('toString / toText', function () {
		var title = new Title('Some random page');

		assert.strictEqual(title.toString(), title.getPrefixedDb());
		assert.strictEqual(title.toText(), title.getPrefixedText());
	});

	it('getExtension', function () {
		function extTest(pagename, ext, description) {
			var title = new Title(pagename);
			assert.strictEqual(title.getExtension(), ext, description || pagename);
		}

		extTest('MediaWiki:Vector.js', 'js');
		extTest('User:Example/common.css', 'css');
		extTest('File:Example.longextension', 'longextension', 'Extension parsing not limited (T38151)');
		extTest('Example/information.json', 'json', 'Extension parsing not restricted from any namespace');
		extTest('Foo.', null, 'Trailing dot is not an extension');
		extTest('Foo..', null, 'Trailing dots are not an extension');
		extTest('Foo.a.', null, 'Page name with dots and ending in a dot does not have an extension');

		// @broken: Throws an exception
		// extTest( '.NET', null, 'Leading dot is (or is not?) an extension' );
	});
});
