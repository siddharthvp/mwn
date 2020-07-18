/** Base file used in tests */

const mwn = require('../src/bot');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect; 
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid_oauth;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	OAuthCredentials: loginCredentials.OAuthCredentials,
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)'
});

let loginBefore = function() {
	this.timeout(7000);

	bot.initOAuth();
	return bot.getTokensAndSiteInfo().then(() => {
		expect(bot.csrfToken).to.be.a('string');
		expect(bot.csrfToken.length).to.be.gt(5);
		assert(bot.csrfToken.endsWith('+\\'));
		expect(bot.title.nameIdMap).to.be.a('object');
		expect(bot.title.legaltitlechars).to.be.a('string');
		expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
	});

};

let logoutAfter = function() {

};

// Export everything
module.exports = { mwn, bot, log, crypto, expect, assert, loginBefore, logoutAfter };