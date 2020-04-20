/**
 * These tests are a substantial copy of
 * <https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js/testcases.js>
 * by Evad37
 */

'use strict';

/* global describe, it */

const mwn = require('../src/index');

const expect = require('chai').expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: false,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

describe('wikitext', async function() {

	it('successfully logs in and gets token & namespaceInfo', function(done) {
		this.timeout(7000);
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
			done();
		});
	});

	it('wikitext parse_links', function() {
		var ll = new bot.wikitext(`
			A [[plain link]]. A [[piped|link]]. An [[invalid[|link]]. A file: [[File:Beans.jpg|thumb|200px]]. A category: [[category:X1|*]]. [[Category:Category without sortkey]].
			[[:Category:Link category]]. [[:File:linked file|disptext]]. [[:Category:Link category|disptext]]. [[:File:File link without disp text]]. A [[:User:Userpage link with colon]].
			An [[image:image|thumb]].
		`);
		ll.parse_links();

		var result = {
			links: [
				{ target: 'Plain link', displaytext: 'plain link' },
				{ target: 'Piped', displaytext: 'link' },
				{ target: 'Category:Link category', displaytext: 'Category:Link category' },
				{ target: 'File:Linked file', displaytext: 'disptext' },
				{ target: 'Category:Link category', displaytext: 'disptext' },
				{ target: 'File:File link without disp text', displaytext: 'File:File link without disp text' },
				{ target: 'User:Userpage link with colon', displaytext: 'User:Userpage link with colon' }
			],
			files: [
				{ target: 'File:Beans.jpg', props: 'thumb|200px' },
				{ target: 'File:Image', props: 'thumb' }
			],
			categories: [
				{ target: 'Category:X1', sortkey: '*' },
				{ target: 'Category:Category without sortkey', sortkey: '' },
			]
		};

		expect(ll.links).to.be.instanceOf(Array);
		expect(ll.links.length).to.equal(7);

		ll.links.forEach((link, idx) => {
			assert(link.target.toText() === result.links[idx].target);
			assert(link.displaytext === result.links[idx].displaytext);
		});
		ll.files.forEach((link, idx) => {
			assert(link.target.toText() === result.files[idx].target);
			assert(link.props === result.files[idx].props);
		});
		ll.categories.forEach((link, idx) => {
			assert(link.target.toText() === result.categories[idx].target);
			assert(link.sortkey === result.categories[idx].sortkey);
		});

	});

	it("Single template, no params", function() {
		var wikitext = "Lorem {{ipsum}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 0, "No parameters");
		assert.equal(parsed[0].wikitext, "{{ipsum}}", "Correct wikitext");
	});
	it("Two templates, no params", function() {
		var wikitext = "Lorem {{ipsum}} dorem {{sum}}";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 2, "Two template found");
		assert.equal(parsed[0].name, "ipsum", "First: Correct name");
		assert.equal(parsed[0].parameters.length, 0, "First: No parameters");
		assert.equal(parsed[0].wikitext, "{{ipsum}}", "First: Correct wikitext");
		assert.equal(parsed[1].name, "sum", "First: Correct name");
		assert.equal(parsed[1].parameters.length, 0, "First: No parameters");
		assert.equal(parsed[1].wikitext, "{{sum}}", "First: Correct wikitext");
	});
	it("Two nested templates, not recursive", function() {
		var wikitext = "Lorem {{ipsum|{{dorem}}}} sum";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "{{dorem}}", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|{{dorem}}", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|{{dorem}}}}", "Correct wikitext");
	});
	it("Two nested templates, recursive", function() {
		var wikitext = "Lorem {{ipsum|{{dorem}}}} sum";
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 2, "Two template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "{{dorem}}", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|{{dorem}}", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|{{dorem}}}}", "Correct wikitext");
		assert.equal(parsed[1].name, "dorem", "Correct name");
		assert.equal(parsed[1].parameters.length, 0, "No parameters");
		assert.equal(parsed[1].wikitext, "{{dorem}}", "Correct wikitext");
	});
	it("More nested templates, recursive (Talk:Eleanor Robinson)", function() {
		var wikitext = `{{WikiProjectBannerShell|1=
	{{WikiProject Biography
	| living=yes
	| class =C
	| listas=Robinson, Eleanor
	| sports-work-group = yes
	| sports-priority =
	| needs-photo = yes}}
	{{WikiProject Athletics
	 |class=C
	 |importance=}}
	{{WikiProject Running
	 |class=C
	 |importance=}}
	{{WikiProject Women's sport
	 |class=C
	 |importance=}}
	}}

	{{DYK talk|31 January|2015|entry= ... that in 1998 '''[[Eleanor Robinson]]''' set a world record of 13 days, 1 hour, 54 minutes for a woman to run {{convert|1000|mi}}?}}

	{{Did you know nominations/Eleanor Robinson}}`;
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 8, "Eight templates found");
		assert.equal(parsed[0].name, "WikiProjectBannerShell", "First: Correct name");
		assert.equal(parsed[0].parameters.length, 1, "First: One parameter");
		assert.equal(parsed[0].parameters[0].name, "1", "First: Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, `{{WikiProject Biography
	| living=yes
	| class =C
	| listas=Robinson, Eleanor
	| sports-work-group = yes
	| sports-priority =
	| needs-photo = yes}}
	{{WikiProject Athletics
	 |class=C
	 |importance=}}
	{{WikiProject Running
	 |class=C
	 |importance=}}
	{{WikiProject Women's sport
	 |class=C
	 |importance=}}`, "First: Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, `|1=
	{{WikiProject Biography
	| living=yes
	| class =C
	| listas=Robinson, Eleanor
	| sports-work-group = yes
	| sports-priority =
	| needs-photo = yes}}
	{{WikiProject Athletics
	 |class=C
	 |importance=}}
	{{WikiProject Running
	 |class=C
	 |importance=}}
	{{WikiProject Women's sport
	 |class=C
	 |importance=}}
	`, "First: Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, `{{WikiProjectBannerShell|1=
	{{WikiProject Biography
	| living=yes
	| class =C
	| listas=Robinson, Eleanor
	| sports-work-group = yes
	| sports-priority =
	| needs-photo = yes}}
	{{WikiProject Athletics
	 |class=C
	 |importance=}}
	{{WikiProject Running
	 |class=C
	 |importance=}}
	{{WikiProject Women's sport
	 |class=C
	 |importance=}}
	}}`, "First: Correct wikitext");
	});

	it("Unnamed parameter", function() {
		var wikitext = "Lorem {{ipsum|foo}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "foo", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|foo", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|foo}}", "Correct wikitext");
	});

	it("Unnamed parameters", function() {
		var wikitext = "Lorem {{ipsum|foo|bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 2, "Two parameters");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct first parameter name");
		assert.equal(parsed[0].parameters[0].value, "foo", "Correct first parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|foo", "Correct first parameter wikitext");
		assert.equal(parsed[0].parameters[1].name, 2, "Correct second parameter name");
		assert.equal(parsed[0].parameters[1].value, "bar", "Correct second parameter value");
		assert.equal(parsed[0].parameters[1].wikitext, "|bar", "Correct second parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|foo|bar}}", "Correct wikitext");
	});

	it("Numbered parameters", function() {
		var wikitext = "Lorem {{ipsum|2=foo|3=bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 2, "Two parameters");
		assert.equal(parsed[0].parameters[0].name, "2", "Correct first parameter name");
		assert.equal(parsed[0].parameters[0].value, "foo", "Correct first parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|2=foo", "Correct first parameter wikitext");
		assert.equal(parsed[0].parameters[1].name, "3", "Correct second parameter name");
		assert.equal(parsed[0].parameters[1].value, "bar", "Correct second parameter value");
		assert.equal(parsed[0].parameters[1].wikitext, "|3=bar", "Correct second parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|2=foo|3=bar}}", "Correct wikitext");
	});

	it("Contains triple-brace parameter", function() {
		var wikitext = "Lorem {{ipsum|{{{1|}}}}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "ipsum", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "{{{1|}}}", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|{{{1|}}}", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{ipsum|{{{1|}}}}}", "Correct wikitext");
	});

	it("Four braces (template name is a template), non-recursive", function() {
		var wikitext = "Lorem {{{{ipsum|one}}|bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "{{ipsum|one}}", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "bar", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|bar", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{{{ipsum|one}}|bar}}", "Correct wikitext");
	});

	it("Four braces (template name is a template), recursive", function() {
		var wikitext = "Lorem {{{{ipsum|one}}|bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 2, "Two templates found");
		assert.equal(parsed[0].name, "{{ipsum|one}}", "First: Correct name");
		assert.equal(parsed[0].parameters.length, 1, "First: One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "First: Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "bar", "First: Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|bar", "First: Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{{{ipsum|one}}|bar}}", "First: Correct wikitext");
		assert.equal(parsed[1].name, "ipsum", "Second: Correct name");
		assert.equal(parsed[1].parameters.length, 1, "Second: One parameter");
		assert.equal(parsed[1].parameters[0].name, 1, "Second: Correct parameter name");
		assert.equal(parsed[1].parameters[0].value, "one", "Second: Correct parameter value");
		assert.equal(parsed[1].parameters[0].wikitext, "|one", "Second: Correct parameter wikitext");
		assert.equal(parsed[1].wikitext, "{{ipsum|one}}", "Second: Correct wikitext");
	});


	it("Five braces (template name is a triple-brace parameter), non-recursive", function() {
		var wikitext = "Lorem {{{{{ipsum|foo}}}|bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates();

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "{{{ipsum|foo}}}", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "bar", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|bar", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{{{{ipsum|foo}}}|bar}}", "Correct wikitext");
	});

	it("Five braces (template name is a triple-brace parameter), recursive", function() {
		var wikitext = "Lorem {{{{{ipsum|foo}}}|bar}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "{{{ipsum|foo}}}", "Correct name");
		assert.equal(parsed[0].parameters.length, 1, "One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "bar", "Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|bar", "Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{{{{ipsum|foo}}}|bar}}", "Correct wikitext");
	});

	it("Six braces (template name is a template, which itself has a template name that is a template), recursive", function() {
		var wikitext = "Lorem {{{{{{ipsum|foo}}|bar}}|baz}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 3, "Three templates found");
		assert.equal(parsed[0].name, "{{{{ipsum|foo}}|bar}}", "First: Correct name");
		assert.equal(parsed[0].parameters.length, 1, "First: One parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "First: Correct parameter name");
		assert.equal(parsed[0].parameters[0].value, "baz", "First: Correct parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|baz", "First: Correct parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{{{{{ipsum|foo}}|bar}}|baz}}", "First: Correct wikitext");
		assert.equal(parsed[1].name, "{{ipsum|foo}}", "Second: Correct name");
		assert.equal(parsed[1].parameters.length, 1, "Second: One parameter");
		assert.equal(parsed[1].parameters[0].name, 1, "Second: Correct parameter name");
		assert.equal(parsed[1].parameters[0].value, "bar", "Second: Correct parameter value");
		assert.equal(parsed[1].parameters[0].wikitext, "|bar", "Second: Correct parameter wikitext");
		assert.equal(parsed[1].wikitext, "{{{{ipsum|foo}}|bar}}", "Second: Correct wikitext");
		assert.equal(parsed[2].name, "ipsum", "Third: Correct name");
		assert.equal(parsed[2].parameters.length, 1, "Third: One parameter");
		assert.equal(parsed[2].parameters[0].name, 1, "Third: Correct parameter name");
		assert.equal(parsed[2].parameters[0].value, "foo", "Third: Correct parameter value");
		assert.equal(parsed[2].parameters[0].wikitext, "|foo", "Third: Correct parameter wikitext");
		assert.equal(parsed[2].wikitext, "{{ipsum|foo}}", "Third: Correct wikitext");
	});

	// Six braces doesn't occur very frequently - search for `insource:/\{{6}/` in
	// specific namespaces to check usage.
	it.skip("Six braces (triple-brace parameter within triple-brace parameter), recursive", function() {
		var wikitext = "Lorem {{foo|{{{{{{ipsum|}}}|bar}}}|baz}} dorem";
		var parsed = new bot.wikitext(wikitext).parse_templates(true);

		assert.equal(parsed.length, 1, "One template found");
		assert.equal(parsed[0].name, "foo", "Correct name");
		assert.equal(parsed[0].parameters.length, 2, "Two parameter");
		assert.equal(parsed[0].parameters[0].name, 1, "Correct first parameter name");
		assert.equal(parsed[0].parameters[0].value, "{{{{{{ipsum|}}}|bar}}}", "Correct first parameter value");
		assert.equal(parsed[0].parameters[0].wikitext, "|{{{{{{ipsum|}}}|bar}}}", "Correct first parameter wikitext");
		assert.equal(parsed[0].parameters[1].name, 2, "Correct second parameter name");
		assert.equal(parsed[0].parameters[1].value, "baz", "Correct second parameter value");
		assert.equal(parsed[0].parameters[1].wikitext, "|baz", "Correct second parameter wikitext");
		assert.equal(parsed[0].wikitext, "{{foo|{{{{{{ipsum|}}}|bar}}}|baz}}", "Correct wikitext");
	});

	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});


});