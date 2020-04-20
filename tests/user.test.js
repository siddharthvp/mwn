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

describe('User', async function() {
	this.timeout(7000);

	it('successfully logs in and gets token & namespaceInfo', function(done) {
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');

			done();
		});
	});

	it('gets user contribs', function(done) {
		var u = new bot.user('SD0001');
		u.contribs().then(response => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length > 500);
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
			done();
		});
	});

	it('gets user logs', function(done) {
		var u = new bot.user('SD0001');
		u.logs().then(response => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length > 10);
			expect(response[0].logid).to.be.a('number');
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
			done();
		});
	});

	it('userpage', function() {
		var u = new bot.user('SD0001');
		expect(u.userpage).to.be.instanceOf(bot.page);
		expect(u.userpage.namespace === 2);
	});


	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});

});