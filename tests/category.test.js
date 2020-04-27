'use strict';

/* global describe, it, before, after */

const mwn = require('../src/index');

const expect = require('chai').expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

describe('Category', async function() {

	before('logs in and gets token & namespaceInfo', function(done) {
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

	after('logs out', function(done) {
		this.timeout(4000);
		bot.logout().then(() => done());
	});


	it('category constructor', function() {
		var cat = new bot.category('Category:Xyz');
		expect(cat.title === 'Xyz' && cat.namespace === 14).to.be.ok;
		var badCatConstruction = function() {
			new bot.category('Template:Abc');
		};
		expect(badCatConstruction).to.throw('not a category page');
		var catWithoutNs = new bot.category('Fridawulfa');
		expect(catWithoutNs.namespace).to.equal(14);
	});

	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});


});