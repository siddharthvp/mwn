const { mwn, expect, sinon } = require('./test_base');

describe('supplementary functions', function() {
	this.timeout(5000);

	var bot = new mwn({
		apiUrl: 'https://en.wikipedia.org/w/api.php',
	});

	it('ores (enwiki)', function() {

		return bot.oresQueryRevisions('https://ores.wikimedia.org/v3/scores/enwiki/',
			['articlequality', 'drafttopic'], '955155786').then(data => {

			expect(data).to.be.an('object');
			expect(Object.keys(data)).to.be.of.length(1);
			expect(data).to.include.all.keys('955155786');
			expect(data['955155786']).to.include.all.keys('articlequality', 'drafttopic');
			expect(Object.keys(data['955155786'])).to.be.of.length(2);
		});
	});

	it('ores with multiple revisions (enwiki)', function() {

		return bot.oresQueryRevisions('https://ores.wikimedia.org/v3/scores/enwiki/',
			['articlequality', 'drafttopic'], [ '955155786', '955155756' ]).then(data => {

			expect(data).to.be.an('object');
			expect(Object.keys(data)).to.be.of.length(2);
			expect(data).to.include.all.keys('955155786', '955155756');
			expect(data['955155786']).to.include.all.keys('articlequality', 'drafttopic');
			expect(Object.keys(data['955155786'])).to.be.of.length(2);
		});

	});

	it('eventstream', function (done) {
		let stream = new bot.stream('recentchange');
		function messageHandler(data) {
			expect(data).to.be.an('object');
			expect(data).to.have.property('wiki').that.is.a('string');
		}
		let spy = sinon.spy(messageHandler);
		stream.addListener({}, spy);
		setTimeout(function () {
			stream.close();
			expect(spy.callCount).to.be.greaterThan(2);
			done();
		}, 2000);
	});

	it('eventstream with since param', function (done) {
		let sinceTime = new bot.date().subtract(5, 'hours');
		let stream = new bot.stream('recentchange', {
			since: sinceTime
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
		setTimeout(function () {
			stream.close();
			expect(spy.callCount).to.be.greaterThan(2);
			done();
		}, 2000);
	});


});
