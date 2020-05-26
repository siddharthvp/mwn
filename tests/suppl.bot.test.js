const { mwn, expect } = require('./test_base');

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

});