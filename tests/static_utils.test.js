'use strict';

const { mwn, bot, expect, assert, loginBefore, logoutAfter } = require('./test_base');

describe('static utils', function() {

	before('logs in and gets token & namespaceInfo', loginBefore);
	after('logs out', logoutAfter);

	it('link', function() {
		expect(mwn.link('Main Page')).to.equal('[[Main Page]]');
		expect(mwn.link('Main Page', 'homepage')).to.equal('[[Main Page|homepage]]');

		var title = new bot.title('main Page');
		expect(mwn.link(title)).to.equal('[[Main Page]]');
		expect(mwn.link(title, 'homepage')).to.equal('[[Main Page|homepage]]');

		var titleWithFragment = new bot.title('Main Page#Did You Know');
		expect(mwn.link(titleWithFragment)).to.equal('[[Main Page#Did You Know]]');
		expect(mwn.link(titleWithFragment, 'homepage')).to.equal('[[Main Page#Did You Know|homepage]]');
	});


	it('template', function() {
		expect(mwn.template('cite', {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');

		expect(mwn.template(new bot.title('template:cite#fragment'), {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');

		// mainspace template
		expect(mwn.template(new bot.title('cite#fragment'), {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{:Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');
	});


	it('table', function() {
		var expected1 = `{| class="wikitable"
|-
! Header text !! Header text !! Header text
|-
| Example || Example || Example
|-
| Example || Example || Example
|}`;

		var table = new mwn.table();
		table.addHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', 'Example', 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.getText()).to.equal(expected1);

		var expected2 = `{| class="wikitable sortable"
|-
! Header1 text !! Header2 text !! Header3 text
|-
| Example11 || Example12 || Example13
|-
| Example21 || Example22 || Example23
|}`;

		table = new mwn.table({ sortable: true });
		table.addHeaders(['Header1 text', 'Header2 text', 'Header3 text']);
		table.addRow(['Example11', 'Example12', 'Example13']);
		table.addRow(['Example21', 'Example22', 'Example23']);
		expect(table.getText()).to.equal(expected2);

		expect(new mwn.table({ sortable: true }).getText()).to.equal(`{| class="wikitable sortable"\n|}`);
		expect(new mwn.table({ plain: true }).getText()).to.equal(`{| \n|}`);

	});

	describe('mwn.util', function() {

		// Tests copied from the original mw.util,
		// https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/tests/qunit/suites/resources/mediawiki/mediawiki.util.test.js


		it( 'escapeRegExp', function () {
			var specials, normal;
			specials = [
				'\\',
				'{',
				'}',
				'(',
				')',
				'[',
				']',
				'|',
				'.',
				'?',
				'*',
				'+',
				'-',
				'^',
				'$'
			];
			normal = [
				'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
				'abcdefghijklmnopqrstuvwxyz',
				'0123456789'
			].join( '' );
			specials.forEach( function ( str ) {
				assert.equal( str.match( new RegExp( mwn.util.escapeRegExp( str ) ) )[ 0 ], str, 'Match ' + str );
			} );
			assert.strictEqual( mwn.util.escapeRegExp( normal ), normal, 'Alphanumerals are left alone' );
		} );

		// from https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/tests/qunit/suites/resources/mediawiki/mediawiki.html.test.js
		it( 'escapeHtml', function () {
			assert.throws(
				function () {
					mwn.util.escapeHtml();
				},
				TypeError,
				'throw a TypeError if argument is not a string'
			);
			assert.strictEqual(
				mwn.util.escapeHtml( '<mw awesome="awesome" value=\'test\' />' ),
				'&lt;mw awesome=&quot;awesome&quot; value=&#039;test&#039; /&gt;',
				'Escape special characters to html entities'
			);
		} );

		it('rawurlencode', function() {
			assert.strictEqual( mwn.util.rawurlencode( 'Test:A & B/Here' ), 'Test%3AA%20%26%20B%2FHere' );
		});

		it( 'wikiUrlencode', function () {
			assert.strictEqual( mwn.util.wikiUrlencode( 'Test:A & B/Here' ), 'Test:A_%26_B/Here' );
			Object.entries( {
				'+': '%2B',
				'&': '%26',
				'=': '%3D',
				':': ':',
				';@$-_.!*': ';@$-_.!*',
				'/': '/',
				'~': '~',
				'[]': '%5B%5D',
				'<>': '%3C%3E',
				'\'': '%27'
			} ).forEach( function ( [input, output] ) {
				assert.strictEqual( mwn.util.wikiUrlencode( input ), output );
			} );
		} );

		var IPV4_CASES = [
			[ false, false, 'Boolean false is not an IP' ],
			[ false, true, 'Boolean true is not an IP' ],
			[ false, '', 'Empty string is not an IP' ],
			[ false, 'abc', '"abc" is not an IP' ],
			[ false, ':', 'Colon is not an IP' ],
			[ false, '124.24.52', 'IPv4 not enough quads' ],
			[ false, '24.324.52.13', 'IPv4 out of range' ],
			[ false, '.24.52.13', 'IPv4 starts with period' ],
			[ true, '124.24.52.13', '124.24.52.134 is a valid IP' ],
			[ true, '1.24.52.13', '1.24.52.13 is a valid IP' ],
			[ false, '74.24.52.13/20', 'IPv4 ranges are not recognized as valid IPs' ]
		];

		var IPV6_CASES = [
			[ false, ':fc:100::', 'IPv6 starting with lone ":"' ],
			[ false, 'fc:100:::', 'IPv6 ending with a ":::"' ],
			[ false, 'fc:300', 'IPv6 with only 2 words' ],
			[ false, 'fc:100:300', 'IPv6 with only 3 words' ],
			[ false, 'fc:100:a:d:1:e:ac:0::', 'IPv6 with 8 words ending with "::"' ],
			[ false, 'fc:100:a:d:1:e:ac:0:1::', 'IPv6 with 9 words ending with "::"' ],
			[ false, ':::' ],
			[ false, '::0:', 'IPv6 ending in a lone ":"' ],
			[ true, '::', 'IPv6 zero address' ],
			[ false, '::fc:100:a:d:1:e:ac:0', 'IPv6 with "::" and 8 words' ],
			[ false, '::fc:100:a:d:1:e:ac:0:1', 'IPv6 with 9 words' ],
			[ false, ':fc::100', 'IPv6 starting with lone ":"' ],
			[ false, 'fc::100:', 'IPv6 ending with lone ":"' ],
			[ false, 'fc:::100', 'IPv6 with ":::" in the middle' ],
			[ true, 'fc::100', 'IPv6 with "::" and 2 words' ],
			[ true, 'fc::100:a', 'IPv6 with "::" and 3 words' ],
			[ true, 'fc::100:a:d', 'IPv6 with "::" and 4 words' ],
			[ true, 'fc::100:a:d:1', 'IPv6 with "::" and 5 words' ],
			[ true, 'fc::100:a:d:1:e', 'IPv6 with "::" and 6 words' ],
			[ true, 'fc::100:a:d:1:e:ac', 'IPv6 with "::" and 7 words' ],
			[ true, '2001::df', 'IPv6 with "::" and 2 words' ],
			[ true, '2001:5c0:1400:a::df', 'IPv6 with "::" and 5 words' ],
			[ true, '2001:5c0:1400:a::df:2', 'IPv6 with "::" and 6 words' ],
			[ false, 'fc::100:a:d:1:e:ac:0', 'IPv6 with "::" and 8 words' ],
			[ false, 'fc::100:a:d:1:e:ac:0:1', 'IPv6 with 9 words' ]
		];

		Array.prototype.push.apply( IPV6_CASES,
			[
				'fc:100::',
				'fc:100:a::',
				'fc:100:a:d::',
				'fc:100:a:d:1::',
				'fc:100:a:d:1:e::',
				'fc:100:a:d:1:e:ac::',
				'::0',
				'::fc',
				'::fc:100',
				'::fc:100:a',
				'::fc:100:a:d',
				'::fc:100:a:d:1',
				'::fc:100:a:d:1:e',
				'::fc:100:a:d:1:e:ac',
				'fc:100:a:d:1:e:ac:0'
			].map( function ( el ) {
				return [ true, el, el + ' is a valid IP' ];
			} )
		);

		it( 'isIPv6Address', function () {
			IPV6_CASES.forEach( function ( ipCase ) {
				assert.strictEqual( mwn.util.isIPv6Address( ipCase[ 1 ] ), ipCase[ 0 ], ipCase[ 2 ] );
			} );
		} );
		it( 'isIPv4Address', function () {
			IPV4_CASES.forEach( function ( ipCase ) {
				assert.strictEqual( mwn.util.isIPv4Address( ipCase[ 1 ] ), ipCase[ 0 ], ipCase[ 2 ] );
			} );
		} );
		it( 'isIPAddress', function () {
			IPV4_CASES.forEach( function ( ipCase ) {
				assert.strictEqual( mwn.util.isIPv4Address( ipCase[ 1 ] ), ipCase[ 0 ], ipCase[ 2 ] );
			} );
			IPV6_CASES.forEach( function ( ipCase ) {
				assert.strictEqual( mwn.util.isIPv6Address( ipCase[ 1 ] ), ipCase[ 0 ], ipCase[ 2 ] );
			} );
		} );

	});

});
