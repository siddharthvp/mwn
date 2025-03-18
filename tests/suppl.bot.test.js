const { Mwn, expect } = require('./base/test_base');

describe('supplementary functions', function () {
	this.timeout(5000);

	const bot = new Mwn({
		apiUrl: 'https://en.wikipedia.org/w/api.php',
		userAgent: 'https://github.com/siddharthvp/mwn (CI testing)',
	});

	it('pageviews', async function () {
		this.timeout(20000);
		await bot.getSiteInfo();
		let page = new bot.Page('Albert Einstein');
		let views = await page.pageViews();
		expect(views).to.be.instanceOf(Array).of.length.greaterThanOrEqual(1);
		expect(views[0]).to.be.an('object').with.property('article').that.equals('Albert_Einstein');

		views = await page.pageViews({
			agent: 'user',
			start: new bot.Date('1 January 2023'),
			end: new bot.Date('5 March 2023'),
		});
		expect(views).to.be.instanceOf(Array).of.length.greaterThanOrEqual(2);
		expect(views[0]).to.be.an('object').with.property('agent').that.equals('user');
	});

	it('wikiwho', async function () {
		this.timeout(10000);
		await bot.getSiteInfo();
		let page = new bot.Page('Dairy in India');
		let data = await page.queryAuthors();
		expect(data).to.be.an('object').with.property('totalBytes').that.is.a('number');
		expect(data).to.have.property('users').that.is.instanceOf(Array).of.length.greaterThan(1);
		expect(data.users[0]).to.be.an('object').with.property('id').that.is.a('number');
		expect(data.users[0]).to.have.property('name').that.is.a('string');
		expect(data.users[0]).to.have.property('percent').that.is.a('number');
		expect(data.users[0]).to.have.property('bytes').that.is.a('number');
	});
});
