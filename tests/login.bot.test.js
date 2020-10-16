'use strict';

const { mwn, expect, assert } = require('./test_base');

const loginCredentials = require('./mocking/loginCredentials.js').account1;

let bot = new mwn({
	hasApiHighLimit: false,
});

describe('login', async function() {
	this.timeout(7000);

	it('successfully logs in and gets token', function(done) {
		bot.loginGetToken({
			apiUrl: loginCredentials.apiUrl,
			username: loginCredentials.username,
			password: loginCredentials.password
		}).then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			done();
		});
	});

	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});

	it('successfully logs in even if assert: user is a default option', function(done) {
		bot.setDefaultParams({
			assert: 'user'
		});
		bot.loginGetToken({
			apiUrl: loginCredentials.apiUrl,
			username: loginCredentials.username,
			password: loginCredentials.password
		}).then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			done();
		});
	});

	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});

	it('successfully logs in thorugh init', async function() {
		await mwn.init(loginCredentials);
	});

	it('successfully logs out', function(done) {
		bot.logout().then(() => done());
	});

});
