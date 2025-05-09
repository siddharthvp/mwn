const { Request, Response } = require('../build/core');
const logger = require('../build/log');
const { MwnError } = require('../build/error');
const nock = require('nock');

const { expect, Mwn } = require('./base/test_base');
const { bot, setup, teardown, sinon, localApiUrl } = require('./base/local_wiki');

describe('core', function () {
	this.timeout(5000);

	describe('Request', function () {
		const makeInstance = (params) => new Request(new Mwn(), params, {});

		it('evaluates correct request method', () => {
			expect(makeInstance({ action: 'query' }).getMethod()).to.equal('get');
			expect(makeInstance({ action: 'parse', title: 'X' }).getMethod()).to.equal('get');
			expect(makeInstance({ action: 'parse', text: 'X' }).getMethod()).to.equal('post');
			expect(makeInstance({ action: 'edit' }).getMethod()).to.equal('post');
		});

		it('preprocess request parameters', () => {
			let req = makeInstance({
				action: 'query',
				param1: undefined,
				param2: true,
				param3: false,
				param4: null,
			});
			req.preprocessParams();
			expect(req.apiParams).to.deep.equal({
				action: 'query',
				param2: '1',
				param4: null,
			});
			expect(req.hasLongFields).to.be.false;
		});
		it("doesn't retry on ENOTFOUND rejection", async function () {
			this.timeout(20000); // CI sometimes takes forever to fail to resolve hostname
			const bot2 = new Mwn({ apiUrl: 'https://somewebsite2342978653424.org/w/api.php' });
			sinon.spy(Response.prototype, 'handleRequestFailure');
			await expect(bot2.getSiteInfo())
				.to.be.eventually.rejectedWith(Error)
				.that.has.property('code')
				.which.equals('ENOTFOUND');
			expect(Response.prototype.handleRequestFailure).to.have.been.calledOnce;
			sinon.restore();
		});

		it('honours method passed in custom options', async function () {
			sinon.spy(Request.prototype, 'handlePost');
			sinon.spy(Request.prototype, 'handleGet');
			let scope = nock(localApiUrl).post(/.*?/).times(1).reply(200, '{}');
			await bot.request({ action: 'query' }, { method: 'post' });
			expect(Request.prototype.handlePost).to.have.been.calledOnce;
			expect(Request.prototype.handleGet).to.not.have.been.called;
			expect(scope.isDone()).to.be.true;
			sinon.restore();
			nock.cleanAll();
		});
	});

	describe('Response', function () {
		before('logs in and gets token & namespaceInfo', setup);
		after('teardown', teardown);

		it('logs on network errors and retries them', async function () {
			nock(localApiUrl, { allowUnmocked: true }).get(/.*?/).times(1).reply(500, 'body', {});
			sinon.spy(console, 'log');
			await expect(bot.query({ action: 'query' })).to.be.eventually.deep.eq({ batchcomplete: true });
			expect(console.log).to.have.been.calledTwice;
			expect(console.log.firstCall.firstArg).to.include('Retrying in ');
			expect(console.log.secondCall.firstArg).to.be.instanceOf(Object).that.has.keys('request', 'response');
			sinon.restore();
		});

		// Errors

		it('handles errors in default (legacy) error format (bc)', async () => {
			await expect(bot.request({ action: 'qwertyuiop' }))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function (error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('info', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('handles errors in errorformat=html', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'html' }))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function (error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('html', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('handles errors in errorformat=plaintext', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'plaintext' }))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function (error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('text', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('handles errors in errorformat=wikitext', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'wikitext' }))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function (error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('text', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		// Warnings

		it('shows warnings', async () => {
			sinon.spy(logger, 'log');
			await bot.request({ action: 'query', titles: 'Main Page', prop: 'revisions', rvprop: 'content' });
			expect(logger.log).to.have.been.calledTwice;
			sinon.restore();
		});

		it('shows warnings in new errorformats', async () => {
			sinon.spy(logger, 'log');
			await bot.request({
				errorformat: 'html',
				action: 'query',
				titles: 'Main Page',
				prop: 'revisions',
				rvprop: 'content',
			});
			expect(logger.log).to.have.been.calledOnce;
			expect(logger.log.firstCall.firstArg).to.include('[W] Warning received from API: query+revisions: Because');

			await bot.request({
				errorformat: 'wikitext',
				action: 'query',
				titles: 'Main Page',
				prop: 'revisions',
				rvprop: 'content',
			});
			expect(logger.log).to.have.been.calledTwice;
			expect(logger.log.secondCall.firstArg).to.include(
				'[W] Warning received from API: query+revisions: Because'
			);

			await bot.request({
				errorformat: 'plaintext',
				action: 'query',
				titles: 'Main Page',
				prop: 'revisions',
				rvprop: 'content',
			});
			expect(logger.log).to.have.been.calledThrice;
			expect(logger.log.thirdCall.firstArg).to.include('[W] Warning received from API: query+revisions: Because');
			sinon.restore();
		});
	});
});
