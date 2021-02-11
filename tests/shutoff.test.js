'use strict';

const {mwn, bot, expect, loginBefore, logoutAfter} = require('./test_base');


describe('bot emergency shutoff', async function() {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', loginBefore);
	after('logs out', function () {
		logoutAfter();
		bot.shutoff.state = false;
	});

	it('set shutoff=true on non-matching regex', async function () {
		bot.enableEmergencyShutoff({
			page: 'SD0001test',
			intervalDuration: 1000,
			condition: /^\s*$/
		});
		await bot.save('SD0001test', 'shutoff', 'Testing bot shutoff (mwn)');
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it('set shutoff=true on condition function returns falsy value', async function () {
		bot.shutoff.state = false; // restore to default state

		bot.enableEmergencyShutoff({
			page: 'SD0001test',
			intervalDuration: 1000,
			condition: function () {
				return false; // function returns false means bot would shut down
			}
		});
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it ('sets shutoff=true even if shutoff options are not configured in function', async function () {
		bot.shutoff.state = false; // restore to default state

		bot.options.shutoff.page = 'SD0001test';
		bot.options.shutoff.intervalDuration = 1000;
		bot.options.shutoff.condition = /^\s*$/;
		bot.enableEmergencyShutoff();
		await bot.save('SD0001test', 'shutoff', 'Testing bot shutoff (mwn)');
		await bot.sleep(1500); // wait till we can be sure that shutoff check is queried
		expect(bot.shutoff.state).to.equal(true);
		bot.disableEmergencyShutoff();
	});

	it('refuses to do API requests when shut off', async function () {
		bot.shutoff.state = true;

		// Fuck, this works!
		await expect(bot.request({action: 'query', titles: 'testtitle'})).to.be.eventually.rejectedWith(mwn.Error)
			.that.has.property('code').which.equals('bot-shutoff');
	});

});
