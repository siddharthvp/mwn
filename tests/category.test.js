'use strict';

const { bot, expect, setup, teardown } = require('./base/test_wiki');

describe('Category', async function () {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);

	let category;

	it('builds a category object', function () {
		let cat = new bot.Category('Category:Xyz');
		expect(cat.title === 'Xyz' && cat.namespace === 14).to.be.ok;
		category = new bot.Category('Category:User_en-2');
		let badCatConstruction = function () {
			new bot.Category('Template:Abc');
		};
		expect(badCatConstruction).to.throw('not a category page');
		var catWithoutNs = new bot.Category('Fridawulfa');
		expect(catWithoutNs.namespace).to.equal(14);
	});

	it('retrieves category members', function () {
		return category.members().then((pgs) => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0].title).to.be.a('string');
		});
	});

	it('retrieves category members using generator', async function () {
		for await (let member of category.membersGen()) {
			expect(member).to.have.keys(['pageid', 'title', 'ns']);
		}
	});

	it('retrieves pages in the category', function () {
		return category.pages().then((pgs) => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0].title).to.be.a('string');
		});
	});
});
