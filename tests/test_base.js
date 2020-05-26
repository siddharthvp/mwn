/** Base file used in tests */

const mwn = require('../src/bot');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

let loginBefore = function(done) {
	this.timeout(7000);
	bot.loginGetToken().then(() => {
		expect(bot.csrfToken).to.be.a('string');
		assert(bot.csrfToken.endsWith('+\\'));
		expect(bot.title.nameIdMap).to.be.a('object');
		expect(bot.title.legaltitlechars).to.be.a('string');
		expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
		done();
	}, () => {
		log('[E] Failed to log in');
	});
};

let logoutAfter = function(done) {
	bot.logout().then(() => done());
};

// Export everything
module.exports = { mwn, bot, log, crypto, expect, assert, loginBefore, logoutAfter };