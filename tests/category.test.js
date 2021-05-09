'use strict';

const { bot, expect, setup, teardown } = require('./test_wiki');

describe('Category', async function () {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);

	let category;

	it('category constructor', function () {
		let cat = new bot.category('Category:Xyz');
		expect(cat.title === 'Xyz' && cat.namespace === 14).to.be.ok;
		category = new bot.category('Category:User_en-2');
		let badCatConstruction = function () {
			new bot.category('Template:Abc');
		};
		expect(badCatConstruction).to.throw('not a category page');
		var catWithoutNs = new bot.category('Fridawulfa');
		expect(catWithoutNs.namespace).to.equal(14);
	});

	it('category members', function () {
		return category.members().then((pgs) => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0].title).to.be.a('string');
		});
	});

	it('category members gen', async function () {
		for await (let member of category.membersGen()) {
			expect(member).to.have.keys(['pageid', 'title', 'ns']);
		}
	});

	it('category pages', function () {
		return category.pages().then((pgs) => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0].title).to.be.a('string');
		});
	});
});
