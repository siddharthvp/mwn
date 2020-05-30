'use strict';

const { mwn, bot, log, crypto, expect, assert, loginBefore, logoutAfter} = require('./test_base');

describe('mwn', async function() {
	this.timeout(5000);

	before('logs in and gets token & namespaceInfo', loginBefore);

	after('logs out', logoutAfter);


	//////////////////////////////////////////
	// SUCCESSFUL                           //
	//////////////////////////////////////////

	it('successfully executes a raw HTTP request', function(done) {

		mwn.rawRequest({
			method: 'get',
			url: 'https://jsonplaceholder.typicode.com/comments',
			responseType: 'json',
			params: {
				postId: 1
			}
		}).then((response) => {
			expect(response).to.be.instanceof(Array);
			expect(response[0]).to.be.instanceof(Object);
			expect(response[0].postId).to.equal(1);
			done();
		}).catch(log);
	});


	it('correctly gets site info', function(done) {

		// unset them to check if they'll correct reset
		bot.title.nameIdMap = null;
		bot.title.idNameMap = null;
		bot.title.legaltitlechars = null;

		expect(function() {
			new bot.title('werwerw');
		}).to.throw('namespace data unavailable: run getSiteInfo() or login() first on the mwn object');

		bot.getSiteInfo().then(function() {
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
			done();
		});
	});

	it('gets the server time', function(done) {
		bot.getServerTime().then(time => {
			expect(time).to.be.a('string');
			var dateobj = new Date(time);
			expect(dateobj.getTime()).to.not.be.NaN;
			done();
		});
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

	describe('methods which modify the wiki', async function() {
		this.timeout(7000);

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

		describe('image uploads', function() {

			var randFileName = 'mwn-' + Math.random() + '.png';

			it('successfully upload image from URL', function(done) {
				var url = 'https://upload.wikimedia.org/wikipedia/test/7/7f/Example_demo_image.png';
				bot.uploadFromUrl(url, randFileName, 'Test upload using mwn').then(data => {
					expect(data.result).to.equal('Success');
					bot.delete('File:' + randFileName, 'Delete after testing (mwn)');
					done();
				});
			});

			// it('successfully uploads without providing a filename with upload()', function(done) {
			// 	bot.upload(__dirname + '/mocking/example1.png', randFileName).then(response => {
			// 		expect(response.result).to.equal('Warning');
			// 		done();
			// 	});
			// });

			// it('successfully uploads and overwrites an image with uploadOverwrite()', function(done) {
			// 	this.timeout(10000);
			// 	bot.uploadOverwrite('SD0001test-43543.png', __dirname + '/mocking/example2.png', 'Test Upload using mwn')
			// 		.then((response) => {
			// 			expect(response.upload.result).to.equal('Success');
			// 			done();
			// 		});
			// });

			// it('successfully skips an upload of an image duplicate with upload()', function(done) {
			// 	bot.upload('SD0001test-43543.png', __dirname + '/mocking/example1.png', 'Test Reasons').then((response) => {
			// 		expect(response.upload.result).to.equal('Warning');
			// 		done();
			// 	});
			// });

		});

	});

	describe('downloads', function() {

		const fs = require('fs');
		var fileTitle = 'File:Example demo image.png';

		it('downloads an image from title without local name specified', function(done) {
			bot.download(fileTitle).then(function() {
				var expectedTitle = 'Example demo image.png';
				expect(fs.readdirSync('.')).to.include(expectedTitle);
				fs.unlinkSync(expectedTitle); // delete the file
				done();
			});
		});

		it('downloads an image from title with local name specified', function(done) {
			bot.download(fileTitle, 'download-test.png').then(function() {
				var expectedTitle = 'download-test.png';
				expect(fs.readdirSync('.')).to.include(expectedTitle);
				fs.unlinkSync(expectedTitle);
				done();
			});
		});

		it('downloads an image from URL', function(done) {
			// get url:
			bot.request({
				action: 'query',
				titles: fileTitle,
				prop: 'imageinfo',
				iiprop: 'url'
			}).then(data => {
				var url = data.query.pages[0].imageinfo[0].url;
				return bot.downloadFromUrl(url);
			}).then(() => {
				var expectedTitle = 'Example_demo_image.png';
				expect(fs.readdirSync('.')).to.include(expectedTitle);
				fs.unlinkSync(expectedTitle);
				done();
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
			expect(e.message).to.include('No API URL');
			done();
		});
	});

	it('fails to parse a non-existing page', function(done) {
		bot.parseTitle('fswer4536tgrr').catch(err => {
			assert(err.code === 'missingtitle');
			done();
		});
	});

	it.skip('rejects to upload a non-existing file with upload()', function(done) {
		bot.upload(false, __dirname + '/mocking/NonExistingImage.png').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('ENOENT');
			done();
		});
	});

});
