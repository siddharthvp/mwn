const {mwn, log, crypto, expect, assert, sinon, verifyTokenAndSiteInfo} = require('./test_base');

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

async function setup() {
	// Switching to BotPassword authentication due to OAuth being unreliable in CI due to
	// https://phabricator.wikimedia.org/T272319. Revert when that is resolved.

	// if (!bot.usingOAuth) {
	// 	return bot.getTokensAndSiteInfo.then(() => verifyTokenAndSiteInfo(bot));
	// }
	if (!bot.loggedIn) {
		return bot.login().then(() => verifyTokenAndSiteInfo(bot));
	}
}

async function teardown() {

}

// Export everything
module.exports = { mwn, bot, bot2, log, crypto, expect, assert, sinon, setup, teardown };
