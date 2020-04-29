const mwn = require('../src/bot');
const expect = require('chai').expect;
// const log = require('semlog').log;

describe('batch operations', function() {

	var bot = new mwn({
		silent: true
	});

	it('batch operation', function(done) {
		bot.batchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						// log(`[E] rejected ${idx}`);
					} else {
						resolve();
						// log(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 7).then((res) => {
			expect(res.counts.successes).to.equal(15);
			expect(res.counts.failures).to.equal(5);
			expect(res.failures).to.deep.equal(['a', 'e', 'i', 'm', 'q']);
			done();
		});
	});

	it('series batch operation', function(done) {
		this.timeout(4000);
		bot.seriesBatchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						// log(`[E] rejected ${idx}`);
					} else {
						resolve();
						// log(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 3).then((res) => {
			expect(res.counts.successes).to.equal(15);
			expect(res.counts.failures).to.equal(5);
			expect(res.failures).to.deep.equal(['a', 'e', 'i', 'm', 'q']);
			done();
		});
	});
});
