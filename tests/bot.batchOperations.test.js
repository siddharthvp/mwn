const mwn = require('../src/bot');
const expect = require('chai').expect;
const log = require('semlog').log;

var debugMode = false;
var debug = function(msg) {
	if (debugMode) {
		log(msg);
	}
};

describe('batch operations', function() {
	this.timeout(4000);

	var bot = new mwn({
		silent: true
	});

	it('batch operation', function(done) {
		bot.batchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 7).then((res) => {
			expect(res.failures).to.deep.equal(['a', 'e', 'i', 'm', 'q']);
			done();
		});
	});

	it('batch operation with 1 retry', function(done) {
		bot.batchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 7, 1).then((res) => {
			expect(res.failures).to.deep.equal(['a', 'q']);
			done();
		});
	});

	it('batch operation with 2 retries', function(done) {
		bot.batchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 7, 2).then((res) => {
			expect(res.failures).to.deep.equal(['a']);
			done();
		});
	});


	it('series batch operation', function(done) {
		bot.seriesBatchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
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

	it('series batch operation with 1 retry', function(done) {
		bot.seriesBatchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 3, 1).then((res) => {
			expect(res.failures).to.deep.equal(['a', 'q']);
			done();
		});
	});

	it('series batch operation with 2 retries', function(done) {
		bot.seriesBatchOperation('abcdefghijklmnopqrst'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
						debug(`[E] rejected ${idx}`);
					} else {
						resolve();
						debug(`[S] resolved ${idx}`);
					}
				}, idx * 10);
			});
		}, 3, 2).then((res) => {
			expect(res.failures).to.deep.equal(['a']);
			done();
		});
	});

});
