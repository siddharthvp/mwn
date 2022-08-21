'use strict';

const { sinon, bot, bot2, expect, setup, teardown } = require('./local_wiki');
const nock = require('nock');
const { Request, Response } = require('../build/core');
const utils = require('../build/utils');
const { mwn } = require('../build/bot');
const logger = require('../build/log');

describe('testing for error recoveries', function () {
	this.timeout(10000);

	const testPage = 'SD0001test';

	before('initializes', function () {
		return Promise.all([
			setup().then(() => {
				return bot.save(testPage, 'lorem ipsum', 'Init test page for testing error recoveries');
			}),
			bot2.login(),
		]);
	});

	after('logs out', teardown);

	it('recovers from badtoken errors', async function () {
		bot.csrfToken = 'invalid-value';
		sinon.spy(mwn.prototype, 'getTokens');
		sinon.spy(logger, 'log');
		let edit = await bot.edit(testPage, function (rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'testing mwn',
			};
		});
		expect(mwn.prototype.getTokens).to.have.been.calledOnce;
		expect(logger.log).to.have.been.calledOnceWith(
			'[W] Encountered badtoken error, fetching new token and retrying'
		);
		expect(edit.result).to.equal('Success');
		sinon.restore();
	});

	it('recovers from session loss failure', async function () {
		bot2.setDefaultParams({ assert: 'user' });
		await bot2.logout();
		sinon.spy(mwn.prototype, 'login');
		sinon.spy(logger, 'log');
		let edit = await bot2.edit(testPage, function (rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'Test edit after session loss',
			};
		});
		expect(mwn.prototype.login).to.be.calledOnce;
		expect(logger.log).to.have.been.calledOnceWith('[W] Received assertuserfailed, attempting to log in and retry');
		expect(edit.result).to.equal('Success');
		sinon.restore();
	});

	it('makes large edits (multipart/form-data) after session loss', async function () {
		await bot.logout();
		const spy = sinon.spy(Request.prototype, 'useMultipartFormData');
		let text = 'lorem ipsum '.repeat(1000);
		return bot
			.edit(testPage, () => {
				return {
					text: text,
					summary: 'Test large edit after session loss',
				};
			})
			.then((response) => {
				expect(response.result).to.equal('Success');
				expect(spy).to.have.returned(true);
			});
	});

	// Test edit conflict recovery logic
	// We need to use a 2nd account as MediaWiki won't consider edits by the same
	// account as edit conflicts
	it('recovers from edit conflicts in edit()', async function () {
		let firsttime = true;
		await bot
			.edit(testPage, async (rev) => {
				// The page has been loaded by `bot`,
				// now edit it using `bot2`
				// This should take place only when the function is invoked the first time,
				// edit() calls itself recursively on an editconflict!
				if (firsttime) {
					await bot2.edit(testPage, (rev) => {
						return {
							text: rev.content.replace(/[a-z]/g, (m) => (Math.random() < 0.5 ? m + m : '')),
							summary: 'trigger edit conflict',
						};
					});
					firsttime = false;
				}
				return {
					text: rev.content.replace(/[a-z]/g, (m) => (Math.random() < 0.5 ? m + m : m)),
					summary: 'test edit conflict recovery',
				};
			})
			.then((response) => {
				expect(response.result).to.equal('Success');
			});
	});

	it('retries on maxlag errors', async function () {
		const maxlagErrorBody = {
			error: {
				code: 'maxlag',
				info: '6 seconds lagged',
				lag: 6,
			},
		};

		mockApi(1, maxlagErrorBody, { 'Retry-After': '6' });
		const retrySpy = sinon.spy(Response.prototype, 'retry');
		const sleepStub = sinon.stub(utils, 'sleep');
		sleepStub.resolves();

		await bot.query({});
		expect(retrySpy).to.have.been.called;
		expect(sleepStub).to.have.been.calledOnceWith(6000);
		sleepStub.resetHistory();
		retrySpy.resetHistory();

		mockApi(1, maxlagErrorBody); // without Retry-After header
		await bot.query({});
		expect(retrySpy).to.have.been.called;
		expect(sleepStub).to.have.been.calledOnceWith(5000);
		sleepStub.restore();
		retrySpy.restore();
	});

	it('retries on readonly errors', async () => {
		mockApi(1, {
			error: {
				code: 'readonly',
			},
		});
		const retrySpy = sinon.spy(Response.prototype, 'retry');
		const sleepStub = sinon.stub(utils, 'sleep');
		sleepStub.resolves();
		await bot.query({});
		expect(retrySpy).to.have.been.called;
		expect(sleepStub).to.have.been.calledWith(5000);
		sleepStub.restore();
		retrySpy.restore();
	});
});

function mockApi(times, body, headers) {
	nock('http://localhost:8080/api.php', { allowUnmocked: true }).get(/.*?/).times(times).reply(200, body, headers);
}
