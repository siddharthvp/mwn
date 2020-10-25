/** Base file used in tests */

const {mwn} = require('../build/bot');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js');

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	...loginCredentials.account1_oauth,
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)'
});
let bot2 = new mwn({
	silent: true,
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)',
	...loginCredentials.account2
});

let loginBefore = function() {
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
module.exports = { mwn, bot, bot2, log, crypto, expect, assert, loginBefore, logoutAfter };
