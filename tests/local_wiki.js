const {mwn, log, crypto, expect, assert, sinon} = require('./test_base');

const baseConfig = {
	silent: true,
	apiUrl: 'http://localhost:8080/api.php',
	password: '12345678901234567890123456789012',
	userAgent: 'mwn (https://github.com/siddharthvp/mwn)',
	defaultParams: {
		assert: 'user'
	}
};

let bot = new mwn({
	...baseConfig,
	username: 'Wikiuser@bp'
});
let bot2 = new mwn({
	...baseConfig,
	username: 'Wikiuser2@bp'
});

let loginBefore = function() {
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
