const { mwn, expect, sinon } = require('./test_base');

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

	it('eventstream', function (done) {
		this.timeout(8000);
		let stream = new bot.stream('recentchange');
		function messageHandler(data) {
			expect(data).to.be.an('object');
			expect(data).to.have.property('wiki').that.is.a('string');
		}
		let spy = sinon.spy(messageHandler);
		stream.addListener({}, spy);
		let interval = setInterval(function () {
			if (spy.callCount > 2) {
				stream.close();
				clearInterval(interval);
				done();
			}
		}, 500);
	});

	it('eventstream with since param', function (done) {
		this.timeout(8000);
		let sinceTime = new bot.date().subtract(5, 'hours');
		let stream = new bot.stream('recentchange', {
			since: sinceTime,
		});
		function messageHandler(data) {
			expect(data).to.be.an('object');
			expect(new bot.date(data.timestamp * 1000)).to.be.within(
				new bot.date(sinceTime).subtract(5, 'minutes'),
				new bot.date(sinceTime).add(10, 'minutes')
			);
			expect(data).to.have.property('wiki').that.is.a('string');
		}
		let spy = sinon.spy(messageHandler);
		stream.addListener({}, spy);
		let interval = setInterval(function () {
			if (spy.callCount > 10) {
				stream.close();
				clearInterval(interval);
				done();
			}
		}, 500);
	});

	it('pageviews', async function () {
		this.timeout(20000);
		await bot.getSiteInfo();
		let page = new bot.page('Albert Einstein');
		let views = await page.pageViews();
		expect(views).to.be.instanceOf(Array).of.length(1);
		expect(views[0]).to.be.an('object').with.property('article').that.equals('Albert_Einstein');

		views = await page.pageViews({
			agent: 'user',
			start: new bot.date('1 January 2021'),
			end: new bot.date('5 March 2021'),
		});
		expect(views).to.be.instanceOf(Array).of.length(2);
		expect(views[0]).to.be.an('object').with.property('agent').that.equals('user');
		expect(views[0]).to.be.an('object').with.property('timestamp').that.equals('2021010100');
		expect(views[1]).to.be.an('object').with.property('timestamp').that.equals('2021020100');
	});
});
