'use strict';

const { bot, sinon, expect, setup, teardown } = require('./local_wiki');
const crypto = require('crypto');
const logger = require('../build/log');
const { MwnError } = require('../build/error');
const { Request } = require('../build/core');

describe('methods which modify the wiki', function () {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);

	after('logs out', teardown);

	var randPage = 'SD0001test-' + crypto.randomBytes(20).toString('hex');

	it('successfully creates a page with create()', function () {
		const spy = sinon.spy(Request.prototype, 'useMultipartFormData');
		return bot
			.create(randPage, '=Some more Wikitext= \n[[Category:Test Page]]', 'Test creation using mwn')
			.then((response) => {
				expect(response.result).to.equal('Success');
				expect(spy).to.have.always.returned(false);
				sinon.restore();
			});
	});

	it('successfully makes large edits (multipart/form-data)', function () {
		const spy = sinon.spy(Request.prototype, 'useMultipartFormData');
		var text = 'lorem ipsum '.repeat(1000);
		return bot
			.edit(randPage, () => {
				return {
					text: text,
					summary: 'Test large edit (mwn)',
				};
			})
			.then((response) => {
				expect(response.result).to.equal('Success');
				expect(spy).to.have.returned(true);
				sinon.restore();
			});
	});

	it('shows warning (see above) on a no-op edit', function () {
		sinon.spy(logger, 'log');
		return bot
			.edit(randPage, (rev) => {
				return rev.content;
			})
			.then(() => {
				expect(logger.log).to.have.been.calledOnce;
			});
	});

	it('successfully edits a page with custom request()', function () {
		return bot
			.request({
				action: 'edit',
				title: randPage,
				text: '=Some Wikitext 2=',
				summary: 'Test edit using mwn',
				token: bot.csrfToken,
			})
			.then((response) => {
				expect(response.edit.result).to.equal('Success');
			});
	});

	it('successfully edits a page with save()', function () {
		return bot
			.save(randPage, '=Some 234 more Wikitext=', 'Some summary')
			.then(() => {
				return bot.save(randPage, '=Some 534 more Wikitext=');
			})
			.then((response) => {
				expect(response.result).to.equal('Success');
			});
	});

	it('successfully creates a new section with newSection()', function () {
		return bot.newSection(randPage, 'Test section', 'Test content').then((response) => {
			expect(response.result).to.equal('Success');
		});
	});

	it('successfully edits a page with edit()', function () {
		return bot
			.edit(randPage, function (rev) {
				expect(rev.content).to.be.a('string');
				expect(rev.timestamp).to.be.a('string');
				expect(new Date(rev.timestamp).getTime()).to.not.be.NaN;
				return {
					text: rev.content + '\n\n\n' + rev.content,
					summary: 'test edit with mwn edit()',
					minor: 1,
				};
			})
			.then(function (result) {
				expect(result.result).to.equal('Success');
			});
	});

	var randPageMoved = randPage + '-moved';

	it('successfully moves a page without leaving redirect', function () {
		return bot.move(randPage, randPageMoved, 'Test move using mwn', { noredirect: 1 }).then((response) => {
			expect(response).to.be.an('object');
			expect(response).to.have.property('from').which.equals(randPage);
			expect(response).to.have.property('to').which.equals(randPageMoved);
			expect(response).to.have.property('redirectcreated').which.equals(false);
		});
	});

	it('successfully deletes a page with delete()', function () {
		return bot.delete(randPageMoved, 'Test mwn').then((response) => {
			expect(response.logid).to.be.a('number');
		});
	});

	it('successfully creates an account', async () => {
		const randAccountName = 'testAcct' + String(Math.random()).slice(3, 8);
		await bot.createAccount(randAccountName, 'testPassword').then((data) => {
			expect(data.status).to.equal('PASS');
		});
		await expect(bot.createAccount(randAccountName, 'testPassword'))
			.to.be.eventually.rejectedWith(MwnError)
			.that.has.property('code')
			.which.equals('userexists');
	});

	it('changes user options', async () => {
		await bot.saveOptions({
			'userjs-mwntest': 'lorem ipsum',
			'userjs-mwntestwithpipe': 'with|pipe',
		});
		await bot.saveOption('userjs-single', 'single');
		const options = (
			await bot.userinfo({
				uiprop: ['options'],
			})
		).options;
		expect(options).to.have.property('userjs-mwntest').that.equals('lorem ipsum');
		expect(options).to.have.property('userjs-mwntestwithpipe').that.equals('with|pipe');
		expect(options).to.have.property('userjs-single').that.equals('single');
	});

	describe('image uploads', function () {
		it('successfully upload image from URL', function () {
			return bot
				.uploadFromUrl(
					'https://upload.wikimedia.org/wikipedia/test/7/7f/Example_demo_image.png',
					'Random-' + Math.random() + '.png',
					'Test upload using mwn'
				)
				.then((data) => {
					expect(data.result).to.equal('Success');
				});
		});

		it('successfully uploads files with upload()', function () {
			return bot
				.upload(__dirname + '/mocking/example1.png', 'Random-' + Math.random() + '.png')
				.then((response) => {
					expect(response.result).to.equal('Success');
				});
		});
	});
});
