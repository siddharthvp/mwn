'use strict';

const { bot, sinon, crypto, expect, loginBefore, logoutAfter} = require('./test_base');
const logger = require('../build/log');

describe('methods which modify the wiki', function() {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', loginBefore);

	after('logs out', logoutAfter);

	var randPage = 'SD0001test-' + crypto.randomBytes(20).toString('hex');

	it('successfully creates a page with create()', function() {
		return bot.create(randPage, '=Some more Wikitext= \n[[Category:Test Page]]', 'Test creation using mwn')
			.then(response => {
				expect(response.result).to.equal('Success');
			});
	});

	it('successfully makes large edits (multipart/form-data)', function() {
		var text = 'lorem ipsum '.repeat(1000);
		return bot.edit(randPage, () => {
			return {
				text: text,
				summary: 'Test large edit (mwn)'
			};
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

	// will have to observe the warning, can't test it by code :(   XXX: use mocks!
	it('shows warning (see above) on a no-op edit', function() {
		sinon.spy(logger, 'log');
		return bot.edit('SD0001test', rev => {
			return rev.content;
		}).then(() => {
			expect(logger.log.calledOnce).to.be.true;
		});
	});

	it('successfully edits a page with custom request()', function() {
		return bot.request({
			action: 'edit',
			title: randPage,
			text: '=Some Wikitext 2=',
			summary: 'Test edit using mwn',
			token: bot.csrfToken
		}).then(response => {
			expect(response.edit.result).to.equal('Success');
		});
	});

	it('successfully edits a page with save()', function() {
		return bot.save(randPage, '=Some 234 more Wikitext=', 'Some summary').then(() => {
			return bot.save(randPage, '=Some 534 more Wikitext=');
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

	it('successfully creates a new section with newSection()', function() {
		return bot.newSection(randPage, 'Test section', 'Test content').then((response) => {
			expect(response.result).to.equal('Success');
		});
	});

	it('successfully edits a page with edit()', function() {
		return bot.edit(randPage, function(rev) {
			expect(rev.content).to.be.a('string');
			expect(rev.timestamp).to.be.a('string');
			return {
				text: rev.content + '\n\n\n' + rev.content,
				summary: 'test edit with mwn edit()',
				minor: 1
			};
		}).then(function(result) {
			expect(result.result).to.equal('Success');
		});
	});

	var randPageMoved = randPage + '-moved';

	it('successfully moves a page without leaving redirect', function() {
		return bot.move(randPage, randPageMoved, 'Test move using mwn', {noredirect: 1}).then((response) => {
			expect(response).to.be.an('object');
			expect(response).to.include.all.keys('from', 'to', 'redirectcreated');
			expect(response.redirectcreated).to.equal(false);
		});
	});

	it('successfully deletes a page with delete()', function() {
		return bot.delete(randPageMoved, 'Test mwn').then((response) => {
			expect(response.logid).to.be.a('number');
		});
	});

	describe('image uploads', function() {

		var randFileName = 'mwn-' + Math.random() + '.png';

		it('successfully upload image from URL', function() {
			var url = 'https://upload.wikimedia.org/wikipedia/test/7/7f/Example_demo_image.png';
			return bot.uploadFromUrl(url, randFileName, 'Test upload using mwn').then(data => {
				expect(data.result).to.equal('Success');
				bot.delete('File:' + randFileName, 'Delete after testing (mwn)');
			});
		});

		it('successfully uploads files with upload()', function() {
			return bot.upload(__dirname + '/mocking/example1.png', randFileName).then(response => {
				expect(response.result).to.equal('Success');
			});
		});

	});

});
