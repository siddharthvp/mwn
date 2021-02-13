const {mwn, log, crypto, expect, assert, sinon} = require('./test_base');

const loginCredentials = require('./mocking/loginCredentials.js');

let bot = new mwn({
	silent: true,
	...loginCredentials.account1,
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)'
});
let bot2 = new mwn({
	silent: true,
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)',
	...loginCredentials.account2
});

let loginBefore = function() {
	// Switching to BotPassword authentication due to OAuth being unreliable in CI due to
	// https://phabricator.wikimedia.org/T272319. Revert when that is resolved.
	return bot.login().then(() => {
		expect(bot.csrfToken).to.be.a('string').of.length.greaterThan(5);
		expect(bot.csrfToken.endsWith('+\\')).to.be.true;
		expect(bot.title.nameIdMap).to.be.a('object');
		expect(bot.title.legaltitlechars).to.be.a('string');
		expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
	});

};

let logoutAfter = function() {
	return bot.logout();
};

// Export everything
module.exports = { mwn, bot, bot2, log, crypto, expect, assert, sinon, loginBefore, logoutAfter };
