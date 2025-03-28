'use strict';

const { bot, assert, expect, setup, teardown } = require('./base/test_wiki');

describe('File', async function () {
	this.timeout(5000);
	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);

	it('file constructor', function () {
		let file = new bot.File('file:Xyz');
		expect(file.title === 'Xyz' && file.namespace === 6).to.be.ok;
		let badFileConstruction = function () {
			new bot.File('Template:Abc');
		};
		expect(badFileConstruction).to.throw('not a file');
		let fileWithoutNs = new bot.File('Fridawulfa');
		expect(fileWithoutNs.namespace).to.equal(6);
	});

	it('getName and getNameText', function () {
		var file = new bot.File('File:Foo_bar.JPG');
		assert.strictEqual(file.getName(), 'Foo_bar');
		assert.strictEqual(file.getNameText(), 'Foo bar');

		file = new bot.File('.foo');
		assert.strictEqual(file.getName(), '');
		assert.strictEqual(file.getNameText(), '');

		file = new bot.File('File:quux pif.jpg');
		assert.strictEqual(file.getNameText(), 'Quux pif', 'First character of title');

		file = new bot.File('File:Glarg_foo_glang.jpg');
		assert.strictEqual(file.getNameText(), 'Glarg foo glang', 'Underscores');
	});

	it('usages', async function () {
		const file = new bot.File('File:Wikipedia-Test_Administrator.png');
		const results = await file.usages();
		expect(results).to.be.an('array').that.has.length.greaterThan(2);
		expect(results.map((r) => r.title)).to.include.members(['Main Page', 'Wikipedia:Administrators']);
	});
});
