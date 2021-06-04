const { mwn, log, expect, assert, sinon, verifyTokenAndSiteInfo } = require('./test_base');

const baseConfig = {
	silent: true,
	apiUrl: 'http://localhost:8080/api.php',
	password: '12345678901234567890123456789012',
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)',
	defaultParams: {
		assert: 'user',
	},
};

let bot = new mwn({
	...baseConfig,
	username: 'Wikiuser@bp',
});
let bot2 = new mwn({
	...baseConfig,
	username: 'Wikiuser2@bp',
});

async function setup() {
	if (!bot.loggedIn) {
		return bot.login().then(() => verifyTokenAndSiteInfo(bot));
	}
}

async function teardown() {}

// Export everything
module.exports = { mwn, bot, bot2, log, expect, assert, sinon, setup, teardown };
