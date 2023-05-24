import { Mwn } from '../..';
import { expect } from 'chai';

/**
 * Basic tests to check that the library works with TypeScript
 * ts-mocha tests/ts/bot.test.ts
 */

const loginCredentials = require('../mocking/loginCredentials');

describe('typescript', async function () {
	this.timeout(5000);
	let bot: Mwn;

	before(function () {
		bot = new Mwn({
			silent: true,
			...loginCredentials.account1_oauth,
			userAgent: 'Mwn (https://github.com/siddharthvp/mwn)',
		});
		return bot.getTokensAndSiteInfo();
	});

	it('works with typescript', function () {
		expect(bot).to.be.instanceOf(Mwn);
		return bot.request({ action: 'query' }).then((data) => {
			expect(data).to.have.key('batchcomplete');
			expect(data.batchcomplete).to.equal(true);
		});
	});

	it('nested classes work too with typescript', function () {
		let page = new bot.Page('Main Page');
		expect(page.getNamespaceId()).to.equal(0);

		let date = new bot.Date('20200101130042');
		expect(date.format('YYYY-MM-DD')).to.equal('2020-01-01');
		expect(date.getDate()).to.equal(1);
	});
});
