'use strict';

const { bot, expect, loginBefore, logoutAfter} = require('./test_base');

describe('Category', async function() {

	before('logs in and gets token & namespaceInfo', loginBefore);
	after('logs out', logoutAfter);

	let category;

	it('category constructor', function() {
		var cat = new bot.category('Category:Xyz');
		expect(cat.title === 'Xyz' && cat.namespace === 14).to.be.ok;
		category = new bot.category('Category:User_en-2');
		var badCatConstruction = function() {
			new bot.category('Template:Abc');
		};
		expect(badCatConstruction).to.throw('not a category page');
		var catWithoutNs = new bot.category('Fridawulfa');
		expect(catWithoutNs.namespace).to.equal(14);
	});

	it('category members', function () {
		category.members().then(pgs => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0]).to.be.a('string');
		});
	});

	it('category pages', function () {
		category.pages().then(pgs => {
			expect(pgs).to.be.instanceOf(Array);
			expect(pgs).to.be.of.length.gte(3);
			expect(pgs[0]).to.be.a('string');
		});
	});


});
