'use strict';

const { Mwn, expect, assert, populateTitleData } = require('./base/test_base');

const bot = new Mwn();
populateTitleData(bot.Title);

describe('static utils', function () {
	it('creates wikilinks', function () {
		expect(Mwn.link('Main Page')).to.equal('[[Main Page]]');
		expect(Mwn.link('Main Page', 'homepage')).to.equal('[[Main Page|homepage]]');

		var title = new bot.Title('main Page');
		expect(Mwn.link(title)).to.equal('[[Main Page]]');
		expect(Mwn.link(title, 'homepage')).to.equal('[[Main Page|homepage]]');

		var titleWithFragment = new bot.Title('Main Page#Did You Know');
		expect(Mwn.link(titleWithFragment)).to.equal('[[Main Page#Did You Know]]');
		expect(Mwn.link(titleWithFragment, 'homepage')).to.equal('[[Main Page#Did You Know|homepage]]');
	});

	it('creates template wikitext', function () {
		expect(
			Mwn.template('cite', {
				author: 'John Doe',
				date: '14 January 2012',
				url: 'https://example.com',
				1: 'web',
			})
		).to.equal('{{cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');

		expect(
			Mwn.template(new bot.Title('template:cite#fragment'), {
				author: 'John Doe',
				date: '14 January 2012',
				url: 'https://example.com',
				1: 'web',
			})
		).to.equal('{{Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');

		// mainspace template
		expect(
			Mwn.template(new bot.Title('cite#fragment'), {
				author: 'John Doe',
				date: '14 January 2012',
				url: 'https://example.com',
				1: 'web',
			})
		).to.equal('{{:Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');
	});

	it('creates tables and parses them', function () {
		var expected1 = `{| class="wikitable sortable"
|-
! Header text !! Header text !! Header text
|-
| Example || Example || Example
|-
| Example || Example || Example
|}`;

		var table = new Mwn.Table({ multiline: false });
		table.addHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', 'Example', 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.getText()).to.equal(expected1);

		expect(bot.Wikitext.parseTable(expected1)).to.deep.equal([
			// Same header name, so object will have only one key
			{ 'Header text': 'Example' },
			{ 'Header text': 'Example' },
		]);

		var expected2 = `{| class="wikitable"
|-
! Header1 text !! Header2 text !! Header3 text
|- style="background: green;"
| Example11 || Example12 || Example13
|-
| Example21 || Example22 || Example23
|}`;

		expect(bot.Wikitext.parseTable(expected2)).to.deep.equal([
			{
				'Header1 text': 'Example11',
				'Header2 text': 'Example12',
				'Header3 text': 'Example13',
			},
			{
				'Header1 text': 'Example21',
				'Header2 text': 'Example22',
				'Header3 text': 'Example23',
			},
		]);

		table = new Mwn.Table({ sortable: false, multiline: false });
		table.addHeaders(['Header1 text', 'Header2 text', 'Header3 text']);
		table.addRow(['Example11', 'Example12', 'Example13'], { style: 'background: green;' });
		table.addRow(['Example21', 'Example22', 'Example23']);
		expect(table.getText()).to.equal(expected2);

		expect(new Mwn.Table().getText()).to.equal(`{| class="wikitable sortable"\n|}`);
		expect(new Mwn.Table({ plain: true }).getText()).to.equal(`{| class="sortable"\n|}`);
		expect(new Mwn.Table({ sortable: false, plain: true, style: 'text-align: center' }).getText()).to.equal(
			`{| style="text-align: center"\n|}`
		);

		table = new Mwn.Table();
		table.addHeaders([
			{ label: 'Header1 text', class: 'foobar' },
			{ style: 'width: 5em;', label: 'Header2 text' },
			{ label: 'Header3 text' },
		]);
		table.addRow(['Example11', 'Example12', 'Example13']);
		table.addRow([{ label: 'Example21', class: 'sampleclass' }, 'Example22', 'Example23']);
		expect(table.getText()).toMatchSnapshot();

		expect(new Mwn.Table().getText()).to.equal(`{| class="wikitable sortable"\n|}`);
		expect(new Mwn.Table({ plain: true }).getText()).to.equal(`{| class="sortable"\n|}`);
		expect(new Mwn.Table({ sortable: false, plain: true, style: 'text-align: center' }).getText()).to.equal(
			`{| style="text-align: center"\n|}`
		);

		table = new Mwn.Table({ multiline: false, classes: ['plainlinks'] });
		table.addHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', 'Example', 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.getText()).toMatchSnapshot();

		// With multiline
		table = new Mwn.Table({ classes: ['plainlinks'] });
		table.addHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', { label: 'Example21', class: 'sampleclass' }, 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.getText()).toMatchSnapshot();
	});

	it('parses tables from AST', async function () {
		var expected1 = `{| class="wikitable sortable"
|-
! Header text !! Header text !! Header text
|-
| Example || Example || Example
|-
| Example || Example || Example
|}`;

		expect(await bot.WikitextAST.parseTable(expected1)).to.deep.equal([
			// Same header name, so object will have only one key
			{ 'Header text': 'Example' },
			{ 'Header text': 'Example' },
		]);

		var expected2 = `{| class="wikitable"
|-
! Header1 text !! Header2 text !! Header3 text
|- style="background: green;"
| Example11 || Example12 || Example13
|-
| Example21 || Example22 || Example23
|}`;

		expect(await bot.WikitextAST.parseTable(expected2)).to.deep.equal([
			{
				'Header1 text': 'Example11',
				'Header2 text': 'Example12',
				'Header3 text': 'Example13',
			},
			{
				'Header1 text': 'Example21',
				'Header2 text': 'Example22',
				'Header3 text': 'Example23',
			},
		]);
	});

	describe('Mwn.util', function () {
		// Tests copied from the original mw.util,
		// https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/tests/qunit/suites/resources/mediawiki/mediawiki.util.test.js

		it('escapes regexps', function () {
			var specials, normal;
			specials = ['\\', '{', '}', '(', ')', '[', ']', '|', '.', '?', '*', '+', '-', '^', '$'];
			normal = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789'].join('');
			specials.forEach(function (str) {
				assert.equal(str.match(new RegExp(Mwn.util.escapeRegExp(str)))[0], str, 'Match ' + str);
			});
			assert.strictEqual(Mwn.util.escapeRegExp(normal), normal, 'Alphanumerals are left alone');
		});

		// from https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/tests/qunit/suites/resources/mediawiki/mediawiki.html.test.js
		it('escapes html', function () {
			assert.throws(
				function () {
					Mwn.util.escapeHtml();
				},
				TypeError,
				'throw a TypeError if argument is not a string'
			);
			assert.strictEqual(
				Mwn.util.escapeHtml('<mw awesome="awesome" value=\'test\' />'),
				'&lt;mw awesome=&quot;awesome&quot; value=&#039;test&#039; /&gt;',
				'Escape special characters to html entities'
			);
		});

		it('encodes URLs (raw)', function () {
			assert.strictEqual(Mwn.util.rawurlencode('Test:A & B/Here'), 'Test%3AA%20%26%20B%2FHere');
		});

		it('encodes URLs (wiki)', function () {
			assert.strictEqual(Mwn.util.wikiUrlencode('Test:A & B/Here'), 'Test:A_%26_B/Here');
			Object.entries({
				'+': '%2B',
				'&': '%26',
				'=': '%3D',
				':': ':',
				';@$-_.!*': ';@$-_.!*',
				'/': '/',
				'~': '~',
				'[]': '%5B%5D',
				'<>': '%3C%3E',
				"'": '%27',
			}).forEach(function ([input, output]) {
				assert.strictEqual(Mwn.util.wikiUrlencode(input), output);
			});
		});

		var IPV4_CASES = [
			[false, false, 'Boolean false is not an IP'],
			[false, true, 'Boolean true is not an IP'],
			[false, '', 'Empty string is not an IP'],
			[false, 'abc', '"abc" is not an IP'],
			[false, ':', 'Colon is not an IP'],
			[false, '124.24.52', 'IPv4 not enough quads'],
			[false, '24.324.52.13', 'IPv4 out of range'],
			[false, '.24.52.13', 'IPv4 starts with period'],
			[true, '124.24.52.13', '124.24.52.134 is a valid IP'],
			[true, '1.24.52.13', '1.24.52.13 is a valid IP'],
			[false, '74.24.52.13/20', 'IPv4 ranges are not recognized as valid IPs'],
		];

		var IPV6_CASES = [
			[false, ':fc:100::', 'IPv6 starting with lone ":"'],
			[false, 'fc:100:::', 'IPv6 ending with a ":::"'],
			[false, 'fc:300', 'IPv6 with only 2 words'],
			[false, 'fc:100:300', 'IPv6 with only 3 words'],
			[false, 'fc:100:a:d:1:e:ac:0::', 'IPv6 with 8 words ending with "::"'],
			[false, 'fc:100:a:d:1:e:ac:0:1::', 'IPv6 with 9 words ending with "::"'],
			[false, ':::'],
			[false, '::0:', 'IPv6 ending in a lone ":"'],
			[true, '::', 'IPv6 zero address'],
			[false, '::fc:100:a:d:1:e:ac:0', 'IPv6 with "::" and 8 words'],
			[false, '::fc:100:a:d:1:e:ac:0:1', 'IPv6 with 9 words'],
			[false, ':fc::100', 'IPv6 starting with lone ":"'],
			[false, 'fc::100:', 'IPv6 ending with lone ":"'],
			[false, 'fc:::100', 'IPv6 with ":::" in the middle'],
			[true, 'fc::100', 'IPv6 with "::" and 2 words'],
			[true, 'fc::100:a', 'IPv6 with "::" and 3 words'],
			[true, 'fc::100:a:d', 'IPv6 with "::" and 4 words'],
			[true, 'fc::100:a:d:1', 'IPv6 with "::" and 5 words'],
			[true, 'fc::100:a:d:1:e', 'IPv6 with "::" and 6 words'],
			[true, 'fc::100:a:d:1:e:ac', 'IPv6 with "::" and 7 words'],
			[true, '2001::df', 'IPv6 with "::" and 2 words'],
			[true, '2001:5c0:1400:a::df', 'IPv6 with "::" and 5 words'],
			[true, '2001:5c0:1400:a::df:2', 'IPv6 with "::" and 6 words'],
			[false, 'fc::100:a:d:1:e:ac:0', 'IPv6 with "::" and 8 words'],
			[false, 'fc::100:a:d:1:e:ac:0:1', 'IPv6 with 9 words'],
		];

		Array.prototype.push.apply(
			IPV6_CASES,
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
				'fc:100:a:d:1:e:ac:0',
			].map(function (el) {
				return [true, el, el + ' is a valid IP'];
			})
		);

		it('checks if user is an IPv6', function () {
			IPV6_CASES.forEach(function (ipCase) {
				assert.strictEqual(Mwn.util.isIPv6Address(ipCase[1]), ipCase[0], ipCase[2]);
			});
		});
		it('checks if user is an IPv4', function () {
			IPV4_CASES.forEach(function (ipCase) {
				assert.strictEqual(Mwn.util.isIPv4Address(ipCase[1]), ipCase[0], ipCase[2]);
			});
		});
		it('checks if user is an IP', function () {
			IPV4_CASES.forEach(function (ipCase) {
				assert.strictEqual(Mwn.util.isIPv4Address(ipCase[1]), ipCase[0], ipCase[2]);
			});
			IPV6_CASES.forEach(function (ipCase) {
				assert.strictEqual(Mwn.util.isIPv6Address(ipCase[1]), ipCase[0], ipCase[2]);
			});
		});
	});
});
