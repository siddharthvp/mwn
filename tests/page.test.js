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

describe('Page', async function() {

	var page;

	before('logs in and gets token & namespaceInfo', function(done) {
		this.timeout(7000);
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');

			// for further tests
			page = new bot.page('Wp:Requests/Permissions');

			done();
		});
	});

	after('logs out', function(done) {
		this.timeout(4000);
		bot.logout().then(() => done());
	});

	it('page inherits title', function() {
		expect(page.toText()).to.equal('Wikipedia:Requests/Permissions');
	});

	it('categories', function(done) {
		page.categories().then(cats => {
			expect(cats).to.be.instanceOf(Array);
			assert(cats.length >= 1); // check it on testwiki, could change
			expect(cats[0].category).to.be.a('string');
			expect(cats[0].sortkey).to.be.a('string');
			done();
		});
	});

	it('links', function(done) {
		page.links().then(links => {
			expect(links).to.be.instanceOf(Array);
			assert(links.length >= 1);
			expect(links[0].title).to.be.a('string');
			done();
		});
	});

});