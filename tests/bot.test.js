'use strict';

const { mwn, bot, log, expect, assert, loginBefore, logoutAfter} = require('./test_base');
const fs = require('fs');

describe('mwn', async function() {
	this.timeout(5000);

	before('logs in and gets token & namespaceInfo', loginBefore);

	after('logs out', logoutAfter);


	//////////////////////////////////////////
	// SUCCESSFUL                           //
	//////////////////////////////////////////

	it('successfully executes a raw HTTP request', function(done) {

		bot.rawRequest({
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

		// unset them to check if they'll correctly reset
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
			let dateobj = new Date(time);
			expect(dateobj.getTime()).to.not.be.NaN;
			done();
		});
	});

	it('parses a JSON page', async function() {
		let jsonpage = await bot.parseJsonPage('Test JSONL page');
		expect(jsonpage).to.be.a('object');
		expect(jsonpage).to.have.all.keys('a');
		expect(jsonpage.a).to.equal('b');
	});

	it('gets token type', function() {
		return bot.getTokenType('edit').then(type => {
			expect(type).to.equal('csrf');
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
		let arr = [];
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
		let title = new bot.title('prOJEcT:Xyz');
		expect(title.toText()).to.equal('Wikipedia:Xyz');
	});

	it('getPagesByPrefix', function(done) {
		bot.getPagesByPrefix('SD0001test').then(pages => {
			expect(pages).to.be.instanceOf(Array);
			expect(pages[0]).to.be.a('string');
			done();
		});
	});

	it('getPagesInCategory', async function() {
		let pages = await bot.getPagesInCategory('Category:User_en-2');
		expect(pages).to.be.instanceOf(Array);
		expect(pages[0]).to.be.a('string');
	});

	let fileTitle = 'File:Example demo image.png';

	it('downloads an image from title without local name specified', function(done) {
		bot.download(fileTitle).then(async () => {
			let expectedTitle = 'Example demo image.png';
			await bot.sleep(2000); // wait for download to complete
			expect(fs.readdirSync('.')).to.include(expectedTitle);
			fs.unlinkSync(expectedTitle); // delete the file
			done();
		});
	});

	it('downloads an image from title with local name specified', function(done) {
		bot.download(fileTitle, 'download-test.png').then(async () => {
			let expectedTitle = 'download-test.png';
			await bot.sleep(2000);
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
			let url = data.query.pages[0].imageinfo[0].url;
			return bot.downloadFromUrl(url);
		}).then(async () => {
			let expectedTitle = 'Example_demo_image.png';
			await bot.sleep(2000);
			expect(fs.readdirSync('.')).to.include(expectedTitle);
			fs.unlinkSync(expectedTitle);
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
			expect(e.message).to.include('No URL');
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
		bot.upload(__dirname + '/mocking/NonExistingImage.png', 'Title', 'Some text').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('ENOENT');
			done();
		});
	});

});
