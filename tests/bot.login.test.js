'use strict';

/* global describe, it */

const mwn = require('../src/bot');

const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	hasApiHighLimit: false,
});

describe('login', async function() {

	'use strict';
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

});