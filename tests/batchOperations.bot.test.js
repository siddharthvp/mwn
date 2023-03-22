const { mwn, expect, log } = require('./base/test_base');

var debugMode = false;
var debug = function (msg) {
	if (debugMode) {
		log(msg);
	}
};

describe('batch operations', function () {
	this.timeout(4000);

	var bot = new mwn({
		silent: true,
	});

	it('batch operation', function () {
		return bot
			.batchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				7
			)
			.then((res) => {
				expect(Object.keys(res.failures)).to.deep.equal(['a', 'e', 'i', 'm', 'q']);
			});
	});

	it('batch operation with 1 retry', function () {
		return bot
			.batchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				7,
				1
			)
			.then((res) => {
				expect(Object.keys(res.failures)).to.deep.equal(['a', 'q']);
			});
	});

	it('batch operation with 2 retries', function () {
		return bot
			.batchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				7,
				2
			)
			.then((res) => {
				expect(Object.keys(res.failures)).to.deep.equal(['a']);
			});
	});

	it('series batch operation', function () {
		return bot
			.seriesBatchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				4
			)
			.then((res) => {
				expect(Object.keys(res.failures)).to.deep.equal(['a', 'e', 'i', 'm', 'q']);
			});
	});

	it('series batch operation with 1 retry', function () {
		return bot
			.seriesBatchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				3,
				1
			)
			.then((res) => {
				// first round failures: a, e, i, m, q
				// second round failures: a, q
				expect(Object.keys(res.failures)).to.deep.equal(['a', 'q']);
			});
	});

	it('series batch operation with 2 retries', function () {
		return bot
			.seriesBatchOperation(
				'abcdefghijklmnopqrst'.split(''),
				(item, idx) => {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							if (idx % 4 === 0) {
								reject();
								debug(`[E] rejected ${idx}`);
							} else {
								resolve();
								debug(`[S] resolved ${idx}`);
							}
						}, 11);
					});
				},
				3,
				2
			)
			.then((res) => {
				expect(Object.keys(res.failures)).to.deep.equal(['a']);
			});
	});
});
