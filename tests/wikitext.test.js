/**
 * These tests are a substantial copy of
 * <https://en.wikipedia.org/wiki/MediaWiki:Gadget-libExtraUtil.js/testcases.js>
 * by Evad37
 */

'use strict';

const { bot, assert, expect, setup, teardown } = require('./base/test_wiki');

describe('wikitext', async function () {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);

	it('parses links', function () {
		var wkt = new bot.Wikitext(`
			A [[plain link]]. A [[piped|link]]. An [[invalid[|link]]. A file: [[File:Beans.jpg|thumb|200px]]. A category: [[category:X1|*]]. [[Category:Category without sortkey]].
			[[:Category:Link category]]. [[:File:linked file|disptext]]. [[:Category:Link category|disptext]]. [[:File:File link without disp text]]. A [[:User:Userpage link with colon]].
			An [[image:image|thumb]].
			A [[File:Image with wikilink in captions.jpg|thumb|A [[link]].]]
		`);
		wkt.parseLinks();

		var result = {
			links: [
				{ target: 'Plain link', displaytext: 'plain link', wikitext: '[[plain link]]', dsr: [6, 19] },
				{ target: 'Piped', displaytext: 'link', wikitext: '[[piped|link]]', dsr: [24, 37] },
				{
					target: 'Category:Link category',
					displaytext: 'Category:Link category',
					wikitext: '[[:Category:Link category]]',
					dsr: [175, 201],
				},
				{
					target: 'File:Linked file',
					displaytext: 'disptext',
					wikitext: '[[:File:linked file|disptext]]',
					dsr: [204, 233],
				},
				{
					target: 'Category:Link category',
					displaytext: 'disptext',
					wikitext: '[[:Category:Link category|disptext]]',
					dsr: [236, 271],
				},
				{
					target: 'File:File link without disp text',
					displaytext: 'File:File link without disp text',
					wikitext: '[[:File:File link without disp text]]',
					dsr: [274, 310],
				},
				{
					target: 'User:Userpage link with colon',
					displaytext: 'User:Userpage link with colon',
					wikitext: '[[:User:Userpage link with colon]]',
					dsr: [315, 348],
				},
				{ target: 'Link', displaytext: 'link', wikitext: '[[link]]', dsr: [436, 443] },
			],
			files: [
				{
					target: 'File:Beans.jpg',
					props: 'thumb|200px',
					wikitext: '[[File:Beans.jpg|thumb|200px]]',
					dsr: [70, 99],
				},
				{ target: 'File:Image', props: 'thumb', wikitext: '[[image:image|thumb]]', dsr: [357, 377] },
				{
					target: 'File:Image with wikilink in captions.jpg',
					props: 'thumb|A [[link]].',
					wikitext: '[[File:Image with wikilink in captions.jpg|thumb|A [[link]].]]',
					dsr: [385, 446],
				},
			],
			categories: [
				{ target: 'Category:X1', sortkey: '*', wikitext: '[[category:X1|*]]', dsr: [114, 130] },
				{
					target: 'Category:Category without sortkey',
					sortkey: '',
					wikitext: '[[Category:Category without sortkey]]',
					dsr: [133, 169],
				},
			],
		};

		expect(wkt.links).to.be.instanceOf(Array);
		expect(wkt.links.length).to.equal(8);

		wkt.links.forEach((link, idx) => {
			expect(link.target.toText()).to.equal(result.links[idx].target);
			expect(link.displaytext).to.equal(result.links[idx].displaytext);
			expect(link.wikitext).to.equal(result.links[idx].wikitext);
			// expect(link.dsr).to.deep.equal(result.links[idx].dsr);
		});
		wkt.files.forEach((link, idx) => {
			expect(link.target.toText()).to.equal(result.files[idx].target);
			expect(link.props).to.equal(result.files[idx].props);
			expect(link.wikitext).to.equal(result.files[idx].wikitext);
			// expect(link.dsr).to.deep.equal(result.files[idx].dsr);
		});
		wkt.categories.forEach((link, idx) => {
			expect(link.target.toText()).to.equal(result.categories[idx].target);
			expect(link.sortkey).to.equal(result.categories[idx].sortkey);
			expect(link.wikitext).to.equal(result.categories[idx].wikitext);
			// expect(link.dsr).to.deep.equal(result.categories[idx].dsr);
		});

		var earlierText = wkt.getText().replace(result.links[0].wikitext, '');
		wkt.removeEntity(result.links[0]);
		expect(earlierText).to.equal(wkt.getText());

		earlierText = wkt.getText().replace(result.files[0].wikitext, '');
		wkt.removeEntity(result.files[0]);
		expect(earlierText).to.equal(wkt.getText());

		earlierText = wkt.getText().replace(result.categories[0].wikitext, '');
		wkt.removeEntity(result.categories[0]);
		expect(earlierText).to.equal(wkt.getText());
	});

	it('parses sections', function () {
		var text = `This is a comment. [[User:SD0001|SD0001]] ([[User talk:SD0001|talk]]) 03:51, 31 August 2020 (UTC)

tryign ==is this asection header?== Let's see.

== this is one ==

 ==how about htis?==
	
===3-2==
some text here for 3-2
==2-3===
some text here for 2-3`;

		expect(bot.Wikitext.parseSections(text)).to.deep.equal([
			{
				level: 1,
				header: null,
				index: 0,
				content:
					"This is a comment. [[User:SD0001|SD0001]] ([[User talk:SD0001|talk]]) 03:51, 31 August 2020 (UTC)\n\ntryign ==is this asection header?== Let's see.\n\n",
			},
			{
				level: 2,
				header: 'this is one',
				index: 147,
				content: '== this is one ==\n\n ==how about htis?==\n\t\n',
			},
			{
				level: 2,
				header: '=3-2',
				index: 189,
				content: '===3-2==\nsome text here for 3-2\n',
			},
			{
				level: 2,
				header: '2-3',
				index: 221,
				content: '==2-3===\nsome text here for 2-3',
			},
		]);
	});

	it('unbinds and rebinds text', function () {
		let u = new bot.Wikitext('Hello world <!-- world --> world');
		u.unbind('<!--', '-->');
		u.text = u.text.replace(/world/g, 'earth');
		expect(u.rebind()).to.equal('Hello earth <!-- world --> earth');
		expect(u.text).to.equal('Hello earth <!-- world --> earth');
		expect(u.getText()).to.equal('Hello earth <!-- world --> earth');

		// with multiple unbinds:
		u = new bot.Wikitext('Hello <nowiki>world</nowiki> <!-- world --> world');
		u.unbind('<!--', '-->');
		u.unbind('<nowiki>', '</nowiki>');
		u.text = u.text.replace(/world/g, 'earth');
		expect(u.rebind()).to.equal('Hello <nowiki>world</nowiki> <!-- world --> earth');
		expect(u.text).to.equal('Hello <nowiki>world</nowiki> <!-- world --> earth');
		expect(u.getText()).to.equal('Hello <nowiki>world</nowiki> <!-- world --> earth');
	});

	it('parses file with problematic unicode characters', function () {
		var wkt = new bot.Wikitext(`{{short description|Polish politician}}
		[[File:Michał Cieślak Sejm 2016.JPG|thumb|Michał Cieślak]]`);
		wkt.parseLinks();
		expect(wkt.files.length).to.equal(1);
	});

	it('Single template, no params; removeEntity for templates', function () {
		var wikitext = 'Lorem {{ipsum}} dorem';
		var wkt = new bot.Wikitext(wikitext);
		var parsed = wkt.parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 0, 'No parameters');
		assert.equal(parsed[0].wikitext, '{{ipsum}}', 'Correct wikitext');

		var earlierText = wkt.getText();
		wkt.removeEntity(wkt.templates[0]);
		expect(earlierText.replace(wkt.templates[0].wikitext, '')).to.equal(wkt.getText());
	});

	it('parseTemplates with count', function () {
		var wikitext = '{{a|zzz|{{er}}}}, {{b|[[File:imag|x|thumb]]}}, {{c|www[[links]]}}';
		var wkt = new bot.Wikitext(wikitext);

		wkt.parseTemplates({ count: 1 });
		assert.equal(wkt.templates.length, 1);
		assert(wkt.templates[0].name, 'a');

		wkt.parseTemplates({ count: 2 });
		assert.equal(wkt.templates.length, 2);

		wkt.parseTemplates({ count: 3 });
		assert.equal(wkt.templates.length, 3);

		wkt.parseTemplates({ count: 4 });
		assert.equal(wkt.templates.length, 3);
	});

	it('parseTemplates with namePredicate', function () {
		var wikitext = '{{a\n|zzz|{{er}}}}, {{lorem|[[File:imag|x|thumb]]}}, {{c|www[[links]]}}';
		var wkt = new bot.Wikitext(wikitext);

		wkt.parseTemplates({
			namePredicate: function (name) {
				return name === 'A';
			},
		});
		assert.equal(wkt.templates.length, 1);

		wkt.parseTemplates({
			namePredicate: function (name) {
				return name.length === 1;
			},
		});
		assert.equal(wkt.templates.length, 2);
	});

	it('parseTemplates with templatePredicate', function () {
		var wikitext = '{{a|zzz|{{er}}}}, {{lorem|[[File:imag|x|thumb]]}}, {{c|www[[links]]}}';
		var wkt = new bot.Wikitext(wikitext);

		wkt.parseTemplates({
			namePredicate: function (name) {
				return name === 'A';
			},
		});
		assert.equal(wkt.templates.length, 1);

		wkt.parseTemplates({
			templatePredicate: function (template) {
				return template.name.length === 1 && template.parameters.length === 1;
			},
		});
		assert.equal(wkt.templates.length, 1);
	});

	it('Two templates, no params', function () {
		var wikitext = 'Lorem {{ipsum}} dorem {{sum}}';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 2, 'Two template found');
		assert.equal(parsed[0].name, 'Ipsum', 'First: Correct name');
		assert.equal(parsed[0].parameters.length, 0, 'First: No parameters');
		assert.equal(parsed[0].wikitext, '{{ipsum}}', 'First: Correct wikitext');
		assert.equal(parsed[1].name, 'Sum', 'First: Correct name');
		assert.equal(parsed[1].parameters.length, 0, 'First: No parameters');
		assert.equal(parsed[1].wikitext, '{{sum}}', 'First: Correct wikitext');
	});
	it('Two nested templates, not recursive', function () {
		var wikitext = 'Lorem {{ipsum|{{dorem}}}} sum';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, '{{dorem}}', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|{{dorem}}', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|{{dorem}}}}', 'Correct wikitext');
	});
	it('Two nested templates, recursive', function () {
		var wikitext = 'Lorem {{ipsum|{{dorem}}}} sum';
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 2, 'Two template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, '{{dorem}}', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|{{dorem}}', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|{{dorem}}}}', 'Correct wikitext');
		assert.equal(parsed[1].name, 'Dorem', 'Correct name');
		assert.equal(parsed[1].parameters.length, 0, 'No parameters');
		assert.equal(parsed[1].wikitext, '{{dorem}}', 'Correct wikitext');
	});
	it('More nested templates, recursive (Talk:Eleanor Robinson)', function () {
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
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 8, 'Eight templates found');
		assert.equal(parsed[0].name, 'WikiProjectBannerShell', 'First: Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'First: One parameter');
		assert.equal(parsed[0].parameters[0].name, '1', 'First: Correct parameter name');
		assert.equal(
			parsed[0].parameters[0].value,
			`{{WikiProject Biography
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
	 |importance=}}`,
			'First: Correct parameter value'
		);
		assert.equal(
			parsed[0].parameters[0].wikitext,
			`|1=
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
	`,
			'First: Correct parameter wikitext'
		);
		assert.equal(
			parsed[0].wikitext,
			`{{WikiProjectBannerShell|1=
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
	}}`,
			'First: Correct wikitext'
		);
	});

	it('Unnamed parameter', function () {
		var wikitext = 'Lorem {{ipsum|foo}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'foo', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|foo', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|foo}}', 'Correct wikitext');
	});

	it('Unnamed parameters', function () {
		var wikitext = 'Lorem {{ipsum|foo|bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 2, 'Two parameters');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct first parameter name');
		assert.equal(parsed[0].parameters[0].value, 'foo', 'Correct first parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|foo', 'Correct first parameter wikitext');
		assert.equal(parsed[0].parameters[1].name, 2, 'Correct second parameter name');
		assert.equal(parsed[0].parameters[1].value, 'bar', 'Correct second parameter value');
		assert.equal(parsed[0].parameters[1].wikitext, '|bar', 'Correct second parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|foo|bar}}', 'Correct wikitext');
	});

	it('Numbered parameters', function () {
		var wikitext = 'Lorem {{ipsum|2=foo|3=bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 2, 'Two parameters');
		assert.equal(parsed[0].parameters[0].name, '2', 'Correct first parameter name');
		assert.equal(parsed[0].parameters[0].value, 'foo', 'Correct first parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|2=foo', 'Correct first parameter wikitext');
		assert.equal(parsed[0].parameters[1].name, '3', 'Correct second parameter name');
		assert.equal(parsed[0].parameters[1].value, 'bar', 'Correct second parameter value');
		assert.equal(parsed[0].parameters[1].wikitext, '|3=bar', 'Correct second parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|2=foo|3=bar}}', 'Correct wikitext');
	});

	it('Contains triple-brace parameter', function () {
		var wikitext = 'Lorem {{ipsum|{{{1|}}}}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'Ipsum', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, '{{{1|}}}', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|{{{1|}}}', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{ipsum|{{{1|}}}}}', 'Correct wikitext');
	});

	it('Four braces (template name is a template), non-recursive', function () {
		var wikitext = 'Lorem {{{{ipsum|one}}|bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, '{{ipsum|one}}', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'bar', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|bar', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{{{ipsum|one}}|bar}}', 'Correct wikitext');
	});

	it('Four braces (template name is a template), recursive', function () {
		var wikitext = 'Lorem {{{{ipsum|one}}|bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 2, 'Two templates found');
		assert.equal(parsed[0].name, '{{ipsum|one}}', 'First: Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'First: One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'First: Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'bar', 'First: Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|bar', 'First: Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{{{ipsum|one}}|bar}}', 'First: Correct wikitext');
		assert.equal(parsed[1].name, 'Ipsum', 'Second: Correct name');
		assert.equal(parsed[1].parameters.length, 1, 'Second: One parameter');
		assert.equal(parsed[1].parameters[0].name, 1, 'Second: Correct parameter name');
		assert.equal(parsed[1].parameters[0].value, 'one', 'Second: Correct parameter value');
		assert.equal(parsed[1].parameters[0].wikitext, '|one', 'Second: Correct parameter wikitext');
		assert.equal(parsed[1].wikitext, '{{ipsum|one}}', 'Second: Correct wikitext');
	});

	it('Five braces (template name is a triple-brace parameter), non-recursive', function () {
		var wikitext = 'Lorem {{{{{ipsum|foo}}}|bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates();

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, '{{{ipsum|foo}}}', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'bar', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|bar', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{{{{ipsum|foo}}}|bar}}', 'Correct wikitext');
	});

	it('Five braces (template name is a triple-brace parameter), recursive', function () {
		var wikitext = 'Lorem {{{{{ipsum|foo}}}|bar}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, '{{{ipsum|foo}}}', 'Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'bar', 'Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|bar', 'Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{{{{ipsum|foo}}}|bar}}', 'Correct wikitext');
	});

	it('Six braces (template name is a template, which itself has a template name that is a template), recursive', function () {
		var wikitext = 'Lorem {{{{{{ipsum|foo}}|bar}}|baz}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 3, 'Three templates found');
		assert.equal(parsed[0].name, '{{{{ipsum|foo}}|bar}}', 'First: Correct name');
		assert.equal(parsed[0].parameters.length, 1, 'First: One parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'First: Correct parameter name');
		assert.equal(parsed[0].parameters[0].value, 'baz', 'First: Correct parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|baz', 'First: Correct parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{{{{{ipsum|foo}}|bar}}|baz}}', 'First: Correct wikitext');
		assert.equal(parsed[1].name, '{{ipsum|foo}}', 'Second: Correct name');
		assert.equal(parsed[1].parameters.length, 1, 'Second: One parameter');
		assert.equal(parsed[1].parameters[0].name, 1, 'Second: Correct parameter name');
		assert.equal(parsed[1].parameters[0].value, 'bar', 'Second: Correct parameter value');
		assert.equal(parsed[1].parameters[0].wikitext, '|bar', 'Second: Correct parameter wikitext');
		assert.equal(parsed[1].wikitext, '{{{{ipsum|foo}}|bar}}', 'Second: Correct wikitext');
		assert.equal(parsed[2].name, 'Ipsum', 'Third: Correct name');
		assert.equal(parsed[2].parameters.length, 1, 'Third: One parameter');
		assert.equal(parsed[2].parameters[0].name, 1, 'Third: Correct parameter name');
		assert.equal(parsed[2].parameters[0].value, 'foo', 'Third: Correct parameter value');
		assert.equal(parsed[2].parameters[0].wikitext, '|foo', 'Third: Correct parameter wikitext');
		assert.equal(parsed[2].wikitext, '{{ipsum|foo}}', 'Third: Correct wikitext');
	});

	// Six braces doesn't occur very frequently - search for `insource:/\{{6}/` in
	// specific namespaces to check usage.
	it.skip('Six braces (triple-brace parameter within triple-brace parameter), recursive', function () {
		var wikitext = 'Lorem {{foo|{{{{{{ipsum|}}}|bar}}}|baz}} dorem';
		var parsed = new bot.Wikitext(wikitext).parseTemplates({ recursive: true });

		assert.equal(parsed.length, 1, 'One template found');
		assert.equal(parsed[0].name, 'foo', 'Correct name');
		assert.equal(parsed[0].parameters.length, 2, 'Two parameter');
		assert.equal(parsed[0].parameters[0].name, 1, 'Correct first parameter name');
		assert.equal(parsed[0].parameters[0].value, '{{{{{{ipsum|}}}|bar}}}', 'Correct first parameter value');
		assert.equal(parsed[0].parameters[0].wikitext, '|{{{{{{ipsum|}}}|bar}}}', 'Correct first parameter wikitext');
		assert.equal(parsed[0].parameters[1].name, 2, 'Correct second parameter name');
		assert.equal(parsed[0].parameters[1].value, 'baz', 'Correct second parameter value');
		assert.equal(parsed[0].parameters[1].wikitext, '|baz', 'Correct second parameter wikitext');
		assert.equal(parsed[0].wikitext, '{{foo|{{{{{{ipsum|}}}|bar}}}|baz}}', 'Correct wikitext');
	});
});
