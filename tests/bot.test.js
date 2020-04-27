'use strict';

/* global describe, it, before, after */

const mwn = require('../src/index');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

describe('mwn', async function() {

	'use strict';
	this.timeout(5000);

	//////////////////////////////////////////
	// SUCCESSFUL                           //
	//////////////////////////////////////////

	before('logs in and gets token & namespaceInfo', function(done) {
		this.timeout(7000);
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
			done();
		});
	});

	after('logs out', function(done) {
		bot.logout().then(() => done());
	});

	it('successfully executes a raw HTTP request', function(done) {

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
		}).catch(log);
	});

	var randPage = 'SD0001test-' + crypto.randomBytes(20).toString('hex');

	it('successfully creates a page with create()', function(done) {
		bot.create(randPage, '=Some more Wikitext= \n[[Category:Test Page]]','Test creation using mwn')
			.then((response) => {
				expect(response.result).to.equal('Success');
				done();
			}).catch(log);
	});

	it('successfully edits a page with custom request()', function(done) {
		bot.request({
			action: 'edit',
			title: randPage,
			text: '=Some Wikitext 2=',
			summary: 'Test edit using mwn',
			token: bot.csrfToken
		}).then((response) => {
			expect(response.edit.result).to.equal('Success');
			done();
		}).catch(log);
	});

	it('successfully reads a page with read()', function(done) {
		bot.read('Main Page').then((response) => {
			expect(response).to.be.instanceOf(Object);
			expect(response).to.include.all.keys('revisions', 'pageid', 'title');
			expect(response.revisions[0].content).to.be.a('string');
			done();
		});
	});

	it('successfully reads multiple pages with read()', function(done) {
		bot.read(['Main Page', 'MediaWiki:Sidebar'], {
			rvprop: 'content|timestamp|user'
		}).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(2);
			expect(response[1]).to.include.all.keys('pageid', 'ns', 'revisions');
			expect(response[0].revisions).to.be.instanceOf(Array);
			expect(response[0].revisions[0]).to.include.all.keys('content');
			done();
		});
	});

	it('successfully reads multiple pages using pageid with read()', function(done) {
		bot.read([11791 /* Main Page */, 25 /* MediaWiki:Sidebar */], {
			rvprop: 'content|timestamp|user'
		}).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(2);
			expect(response[1]).to.include.all.keys('pageid', 'ns', 'revisions');
			expect(response[0].revisions).to.be.instanceOf(Array);
			expect(response[0].revisions[0]).to.include.all.keys('content');
			done();
		});
	});

	it('successfully reads apilimit+ pages with read', function(done) {
		this.timeout(10000);
		var arr = [];
		for (let i=1; i<=60; i++) {
			arr.push(`page${i}`);
		}
		bot.read(arr).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(60);
			assert(response[45].missing === true ||
				typeof response[45].revisions[0].content === 'string');
			done();
		});
	});

	it('successfully edits a page with save()', function(done) {
		bot.save(randPage, '=Some 234 more Wikitext=', 'Some summary').then(() => {
			return bot.save(randPage, '=Some 534 more Wikitext=');
		}).then((response) => {
			expect(response.result).to.equal('Success');
			done();
		});
	});

	it('successfully creates a new section with newSection()', function(done) {
		bot.newSection(randPage, 'Test section', 'Test content').then((response) => {
			expect(response.result).to.equal('Success');
			done();
		});
	});

	it('successfully edits a page with edit()', function(done) {
		bot.edit(randPage, function(rev) {
			expect(rev.content).to.be.a('string');
			expect(rev.timestamp).to.be.a('string');
			return {
				text: rev.content + '\n\n\n' + rev.content,
				summary: 'test edit with mwn edit()',
				minor: 1
			};
		}).then(function(result) {
			expect(result.result).to.equal('Success');
			done();
		});
	});

	var randPageMoved = randPage + '-moved';

	it('successfully moves a page without leaving redirect', function(done) {
		bot.move(randPage, randPageMoved, 'Test move using mwn', {noredirect: 1}).then((response) => {
			expect(response).to.be.an('object');
			expect(response).to.include.all.keys('from', 'to', 'redirectcreated');
			expect(response.redirectcreated).to.equal(false);
			done();
		});
	});

	it('successfully deletes a page with delete()', function(done) {
		bot.delete(randPageMoved, 'Test mwn').then((response) => {
			expect(response.logid).to.be.a('number');
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

	it('successfully parses wikitext', function(done) {
		bot.parseWikitext('[[link]]s.')
			.then(parsedtext => {
				expect(parsedtext).to.be.a('string');
				assert(parsedtext.startsWith(`<div class="mw-parser-output"><p><a href="/wiki/Link" title="Link">links</a>.`));
				done();
			});
	});

	it('successfully parses a page', function(done) {
		bot.parseTitle('MediaWiki:Sidebar').then(parsed => {
			expect(parsed).to.be.a('string');
			done();
		});
	});

	it('batch operation', function(done) {
		bot.batchOperation('abfwefdvfvdfbojcsjcs'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
					} else {
						resolve();
					}
				}, idx * 10);
			});
		}, 7).then((res) => {
			expect(res.successes).to.equal(15);
			expect(res.failures).to.equal(5);
			done();
		});
	});

	it('series batch operation', function(done) {
		this.timeout(4000);
		bot.seriesBatchOperation('abfwefdvfvdfbojcsjcs'.split(''), (item, idx) => {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					if (idx % 4 === 0) {
						reject();
					} else {
						resolve();
					}
				}, idx * 10);
			});
		}, 3).then((res) => {
			expect(res.successes).to.equal(15);
			expect(res.failures).to.equal(5);
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
	// 	bot.loginGetToken(loginCredentials.valid).then(() => {
	// 		return bot.upload(false, __dirname + '/mocking/example1.png');
	// 	}).then((response) => {
	// 		expect(response.upload.result).to.equal('Warning');
	// 		done();
	// 	}).catch((e) => {
	// 		log(e);
	// 	});
	// });

	it.skip('successfully skips an upload of an image duplicate with upload()', function(done) {
		bot.upload('SD0001test-43543.png', __dirname + '/mocking/example1.png', 'Test Reasons').then((response) => {
			expect(response.upload.result).to.equal('Warning');
			done();
		});
	});


	it('title methods work', function() {
		var title = new bot.title('prOJEcT:Xyz');
		expect(title.toText()).to.equal('Wikipedia:Xyz');
	});

	it('getPagesByPrefix', function(done) {
		bot.getPagesByPrefix('SD0001test').then(pages => {
			expect(pages).to.be.instanceOf(Array);
			expect(pages[0]).to.be.a('string');
			done();
		});
	});

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

	it('fails to parse a non-existing page', function(done) {
		bot.parseTitle('fswer4536tgrr').catch(err => {
			assert(err.code === 'missingtitle');
			done();
		});
	});

	it('rejects to upload a non-existing file with upload()', function(done) {
		bot.upload(false, __dirname + '/mocking/NonExistingImage.png').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('ENOENT');
			done();
		});
	});

});
