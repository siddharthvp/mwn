'use strict';

/* global describe, it */

const mwn = require('../mwn');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js');

describe('mwn Request', async function() {

	'use strict';


	//////////////////////////////////////////
	// SUCCESSFUL                           //
	//////////////////////////////////////////

	it('successfully executes a raw HTTP request', function(done) {
		let bot = new mwn();

		bot.rawRequest({
			method: 'GET',
			uri: 'https://jsonplaceholder.typicode.com/comments',
			json: true,
			qs: {
				postId: 1
			}
		}).then((response) => {
			expect(response).to.be.instanceof(Array);
			expect(response[0]).to.be.instanceof(Object);
			expect(response[0].postId).to.equal(1);
			done();
		}).catch((err) => {
			log(err);
		});
	});

	let bot = new mwn({
		silent: true
	});

	it('successfully logs in and gets token', function(done) {
		this.timeout(10000);
		bot.loginGetEditToken(loginCredentials.valid).then(function() {
			expect(bot.editToken).to.be.a('string');
			assert(bot.editToken.endsWith('+\\'));
			done();
		});
	});

	it('successfully purges pages from page id', function(done) {
		bot.purge([11791]).then(function(response) {
			expect(response).to.be.instanceOf(Array);
			expect(response[0].purged).to.equal(true);
			done();
		});
	});

	it('successfully edits a page with custom request()', function(done) {
		bot.request({
			action: 'edit',
			title: 'SD0001test',
			text: '=Some Wikitext 2=',
			summary: 'Test Edit',
			token: bot.editToken
		}).then((response) => {
			expect(response.edit.result).to.equal('Success');
			done();
		}).catch((err) => {
			log(err);
		});
	});

	var randPage = 'SD0001test-' + crypto.randomBytes(20).toString('hex');

	it('successfully creates a page with create()', function(done) {
		bot.create(randPage, '=Some more Wikitext= [[Category:Test Page]]','Test Create')
			.then((response) => {
				expect(response.result).to.equal('Success');
				done();
			}).catch((err) => {
				log(err);
			});
	});

	it('successfully reads a page with read()', function(done) {
		bot.read('Main Page').then((response) => {
			expect(response).to.be.instanceOf(Object);
			expect(response).to.include.all.keys('revisions', 'pageid', 'title');
			expect(response.revisions[0].content).to.be.a('string');
			done();
		}).catch((err) => {
			log(err);
		});
	});

	it('successfully reads multiple pages with read()', function(done) {
		bot.read(['Main Page', 'MediaWiki:Sidebar']).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(2);
			expect(response[1]).to.include.all.keys('pageid', 'ns', 'revisions');
			expect(response[0].revisions).to.be.instanceOf(Array);
			expect(response[0].revisions[0]).to.include.all.keys('content');
			done();
		}).catch((err) => {
			log(err);
		});
	});

	// it('successfully reads a page read() with stacked promises', function(done) {
	// 	this.timeout(3000);
	// 	let bot = new mwn();
	// 	bot.login(loginCredentials.valid).then(() => {
	// 		bot.read('Test Page', {timeout: 8000}).then((response) => {
	// 			expect(response).to.have.any.keys('query');
	// 			expect(response.query).to.have.any.keys('pages');
	// 			done();
	// 		}).catch((err) => {
	// 			log(err);
	// 		});
	// 	}).catch((err) => {
	// 		log(err);
	// 	});
	// });

	// it('successfully updates a page with update()', function(done) {
	// 	bot.save(randPage, '=Some more Wikitext__1=', 'Test mwn').then(() => {
	// 		return bot.update(randPage, '=Some more Wikitext__2=');
	// 	}).then((response) => {
	// 		expect(response.result).to.equal('Success');
	// 		// expect(bot.counter.fulfilled).to.equal(5);  // ??
	// 		done();
	// 	}).catch((err) => {
	// 		log(err);
	// 	});
	// });


	it('successfully edits a page with save()', function(done) {
		this.timeout(3000);
		bot.save(randPage, '=Some 234 more Wikitext=', 'Some summary').then(() => {
			return bot.save(randPage, '=Some 534 more Wikitext=');
		}).then((response) => {
			expect(response.result).to.equal('Success');
			done();
		});
	});

	var randPageMoved = randPage + '-moved';

	it('successfully moves a page without leaving redirect', function(done) {
		this.timeout(3000);
		bot.move(randPage, randPageMoved, 'Test move using mwn', {noredirect: 1}).then((response) => {
			expect(response).to.be.an('object');
			expect(response).to.include.all.keys('from', 'to', 'redirectcreated');
			expect(response.redirectcreated).to.equal(false);
			done();
		});
	});

	it('successfully deletes a page with delete()', function(done) {
		this.timeout(3000);
		bot.delete(randPageMoved, 'Test mwn').then((response) => {
			expect(response.logid).to.be.a('number');
			done();
		});
	});

	// doesn't work
	it.skip('successfully uploads and overwrites an image with uploadOverwrite()', function(done) {
		this.timeout(10000);
		bot.uploadOverwrite('SD0001test-43543.png', __dirname + '/mocking/example2.png', 'Test Upload using mwn')
			.then((response) => {
				expect(response.upload.result).to.equal('Success');
				done();
			}).catch((e) => {
				log(e);
			});
	});

	// it('successfully uploads without providing a filename with upload()', function(done) {
	// 	this.timeout(3000);
	// 	let bot = new mwn();
	// 	bot.loginGetEditToken(loginCredentials.valid).then(() => {
	// 		return bot.upload(false, __dirname + '/mocking/example1.png');
	// 	}).then((response) => {
	// 		expect(response.upload.result).to.equal('Warning');
	// 		done();
	// 	}).catch((e) => {
	// 		log(e);
	// 	});
	// });

	it.skip('successfully skips an upload of an image duplicate with upload()', function(done) {
		this.timeout(3000);
		bot.upload('SD0001test-43543.png', __dirname + '/mocking/example1.png', 'Test Reasons').then((response) => {
			expect(response.upload.result).to.equal('Warning');
			done();
		});
	});


	//////////////////////////////////////////
	// UNSUCCESSFUL                         //
	//////////////////////////////////////////

	it('rejects deleting a non-existing page with delete()', function(done) {
		bot.delete('Non-Existing Page8s56df3f2sd624', 'Test Reasons')
			.catch((e) => {
				expect(e).to.be.an.instanceof(Error);
				expect(e.message).to.include('missingtitle');
				done();
			});
	});

	it('cannot edit a page without providing API URL / Login', function(done) {
		new mwn().save('Main Page', '=Some more Wikitext=', 'Test Upload').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('No URI');
			done();
		});
	});

	it('rejects to upload a non-existing file with upload()', function(done) {
		this.timeout(3000);
		bot.upload(false, __dirname + '/mocking/NonExistingImage.png').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('ENOENT');
			done();
		});
	});

});
