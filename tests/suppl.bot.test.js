const { mwn, expect } = require('./base/test_base');

describe('supplementary functions', function () {
	this.timeout(5000);

	const bot = new mwn({
		apiUrl: 'https://en.wikipedia.org/w/api.php',
		userAgent: 'https://github.com/siddharthvp/mwn (CI testing)',
	});

	it('ores (enwiki)', function () {
		return bot
			.oresQueryRevisions(
				'https://ores.wikimedia.org/v3/scores/enwiki/',
				['articlequality', 'drafttopic'],
				'955155786'
			)
			.then((data) => {
				expect(data).to.be.an('object');
				expect(Object.keys(data)).to.be.of.length(1);
				expect(data).to.include.all.keys('955155786');
				expect(data['955155786']).to.include.all.keys('articlequality', 'drafttopic');
				expect(Object.keys(data['955155786'])).to.be.of.length(2);
			});
	});

	it('ores with multiple revisions (enwiki)', function () {
		return bot
			.oresQueryRevisions(
				'https://ores.wikimedia.org/v3/scores/enwiki/',
				['articlequality', 'drafttopic'],
				['955155786', '955155756']
			)
			.then((data) => {
				expect(data).to.be.an('object');
				expect(Object.keys(data)).to.be.of.length(2);
				expect(data).to.include.all.keys('955155786', '955155756');
				expect(data['955155786']).to.include.all.keys('articlequality', 'drafttopic');
				expect(Object.keys(data['955155786'])).to.be.of.length(2);
			});
	});

	it('pageviews', async function () {
		this.timeout(20000);
		await bot.getSiteInfo();
		let page = new bot.Page('Albert Einstein');
		let views = await page.pageViews();
		expect(views).to.be.instanceOf(Array).of.length(1);
		expect(views[0]).to.be.an('object').with.property('article').that.equals('Albert_Einstein');

		views = await page.pageViews({
			agent: 'user',
			start: new bot.Date('1 January 2021'),
			end: new bot.Date('5 March 2021'),
		});
		expect(views).to.be.instanceOf(Array).of.length(2);
		expect(views[0]).to.be.an('object').with.property('agent').that.equals('user');
		expect(views[0]).to.be.an('object').with.property('timestamp').that.equals('2021010100');
		expect(views[1]).to.be.an('object').with.property('timestamp').that.equals('2021020100');
	});

	it('wikiwho', async function () {
		this.timeout(10000);
		await bot.getSiteInfo();
		let page = new bot.page('Dairy in India');
		let data = await page.queryAuthors();
		expect(data).to.be.an('object').with.property('totalBytes').that.is.a('number');
		expect(data).to.have.property('users').that.is.instanceOf(Array).of.length.greaterThan(1);
		expect(data.users[0]).to.be.an('object').with.property('id').that.is.a('number');
		expect(data.users[0]).to.have.property('name').that.is.a('string');
		expect(data.users[0]).to.have.property('percent').that.is.a('number');
		expect(data.users[0]).to.have.property('bytes').that.is.a('number');
	});
});
