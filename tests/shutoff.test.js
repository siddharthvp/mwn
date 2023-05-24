'use strict';

const { Mwn, bot, expect, setup, teardown } = require('./base/local_wiki');

describe('bot emergency shutoff', async function () {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', function () {
		teardown();
		bot.shutoff.state = false;
	});

	const testPage = 'SD0001test';

	it('set shutoff=true on non-matching regex', async function () {
		bot.enableEmergencyShutoff({
			page: testPage,
			intervalDuration: 1000,
			condition: /^\s*$/,
		});
		await bot.save(testPage, 'shutoff', 'Testing bot shutoff');
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it('set shutoff=true on condition function returns falsy value', async function () {
		bot.shutoff.state = false; // restore to default state

		bot.enableEmergencyShutoff({
			page: testPage,
			intervalDuration: 1000,
			condition: function () {
				return false; // function returns false means bot would shut down
			},
		});
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it('sets shutoff=true even if shutoff options are not configured in function', async function () {
		bot.shutoff.state = false; // restore to default state

		bot.options.shutoff.page = testPage;
		bot.options.shutoff.intervalDuration = 1000;
		bot.options.shutoff.condition = /^\s*$/;
		bot.enableEmergencyShutoff();
		await bot.save(testPage, 'shutoff', 'Testing bot shutoff (mwn)');
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it('refuses to do API requests when shut off', async function () {
		bot.shutoff.state = true;

		// Fuck, this works!
		await expect(bot.request({ action: 'query', titles: 'testtitle' }))
			.to.be.eventually.rejectedWith(Mwn.Error)
			.that.has.property('code')
			.which.equals('bot-shutoff');
	});
});
