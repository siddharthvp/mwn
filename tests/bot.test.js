'use strict';

const { mwn, bot, expect, assert, setup, teardown } = require('./test_wiki');
const fs = require('fs');
const {MwnError} = require("../build/error");

describe('mwn', async function() {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', setup);

	after('logs out', teardown);


	//////////////////////////////////////////
	// SUCCESSFUL                           //
	//////////////////////////////////////////

	it('successfully executes a raw HTTP request', function() {

		return bot.rawRequest({
			method: 'get',
			url: 'https://jsonplaceholder.typicode.com/comments',
			responseType: 'json',
			params: {
				postId: 1
			}
		}).then((response) => {
			response = response.data;
			expect(response).to.be.instanceof(Array);
			expect(response[0]).to.be.instanceof(Object);
			expect(response[0].postId).to.equal(1);
		});
	});


	it('correctly gets site info', function() {

		// unset them to check if they'll correctly reset
		bot.title.nameIdMap = null;
		bot.title.idNameMap = null;
		bot.title.legaltitlechars = null;

		expect(function() {
			new bot.title('werwerw');
		}).to.throw('namespace data unavailable: run getSiteInfo() or login() first on the mwn object');

		return bot.getSiteInfo().then(function() {
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
		});
	});

	it('gets the server time', function() {
		return bot.getServerTime().then(time => {
			expect(time).to.be.a('string');
			let dateobj = new Date(time);
			expect(dateobj.getTime()).to.not.be.NaN;
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

	it('correctly sets logging config', function () {
		const {logConfig} = require('../build/log');
		mwn.setLoggingConfig({
			printYaml: true
		});
		expect(logConfig.printYaml).to.equal(true);
	});




	it('successfully reads a page with read()', function() {
		return bot.read('Main Page').then((response) => {
			expect(response).to.be.instanceOf(Object);
			expect(response).to.include.all.keys('revisions', 'pageid', 'title');
			expect(response.revisions[0].content).to.be.a('string');
		});
	});

	it('successfully reads multiple pages with read()', function() {
		return bot.read(['Main Page', 'MediaWiki:Sidebar'], {
			rvprop: 'content|timestamp|user'
		}).then((response) => {
			expect(response).to.be.instanceOf(Array).of.length(2);
			expect(response[1]).to.include.all.keys('pageid', 'ns', 'revisions');
			expect(response[0].revisions).to.be.instanceOf(Array);
			expect(response[0].revisions[0]).to.include.all.keys('content');
		});
	});

	it('successfully reads multiple pages using pageid with read()', function() {
		return bot.read([11791 /* Main Page */, 25 /* MediaWiki:Sidebar */], {
			rvprop: 'content|timestamp|user'
		}).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(2);
			expect(response[1]).to.include.all.keys('pageid', 'ns', 'revisions');
			expect(response[0].revisions).to.be.instanceOf(Array);
			expect(response[0].revisions[0]).to.include.all.keys('content');
		});
	});

	it('successfully reads apilimit+ pages with read', function() {
		let arr = [];
		for (let i=1; i<=60; i++) {
			arr.push(`page${i}`);
		}
		return bot.read(arr).then((response) => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.equal(60);
			assert(response[45].missing === true ||
				typeof response[45].revisions[0].content === 'string');
		});
	});

	it('successfully purges pages from page id', function() {
		return bot.purge([11791]).then(function(response) {
			expect(response).to.be.instanceOf(Array);
			expect(response[0].purged).to.equal(true);
		});
	});

	it('successfully parses wikitext', function() {
		return bot.parseWikitext('[[link]]s.')
			.then(parsedtext => {
				expect(parsedtext).to.be.a('string');
				assert(parsedtext.startsWith(`<div class="mw-parser-output"><p><a href="/wiki/Link" title="Link">links</a>.`));
			});
	});

	it('successfully parses a page', function() {
		return bot.parseTitle('MediaWiki:Sidebar').then(parsed => {
			expect(parsed).to.be.a('string');
		});
	});

	it('title methods work', function() {
		let title = new bot.title('prOJEcT:Xyz');
		expect(title.toText()).to.equal('Wikipedia:Xyz');
	});

	it('getPagesByPrefix', function() {
		return bot.getPagesByPrefix('SD0001test').then(pages => {
			expect(pages).to.be.instanceOf(Array);
			expect(pages[0]).to.be.a('string');
		});
	});

	it('getPagesInCategory', async function() {
		let pages = await bot.getPagesInCategory('Category:User_en-2');
		expect(pages).to.be.instanceOf(Array);
		expect(pages[0]).to.be.a('string');
	});

	it('getMessages', async function () {
		let messages = await bot.getMessages(['and', 'word-separator']);
		expect(messages).to.deep.equal({
			'and': ' and',
			'word-separator': ' '
		});
		let singleMessage = await bot.getMessages('colon-separator');
		expect(singleMessage).to.deep.equal({
			'colon-separator': ': '
		});
	});

	let fileTitle = 'File:Example demo image.png';

	it('downloads an image from title without local name specified', function() {
		return bot.download(fileTitle).then(async () => {
			let expectedTitle = 'Example demo image.png';
			await bot.sleep(2000); // wait for download to complete
			expect(fs.readdirSync('.')).to.include(expectedTitle);
			fs.unlinkSync(expectedTitle); // delete the file
		});
	});

	it('downloads an image from title with local name specified', function() {
		return bot.download(fileTitle, 'download-test.png').then(async () => {
			let expectedTitle = 'download-test.png';
			expect(fs.readdirSync('.')).to.include(expectedTitle);
			fs.unlink(expectedTitle, () => {});
		});
	});

	it('downloads an image from URL', function() {
		// get url:
		return bot.request({
			action: 'query',
			titles: fileTitle,
			prop: 'imageinfo',
			iiprop: 'url'
		}).then(data => {
			let url = data.query.pages[0].imageinfo[0].url;
			return bot.downloadFromUrl(url);
		}).then(async () => {
			let expectedTitle = 'Example_demo_image.png';
			expect(fs.readdirSync('.')).to.include(expectedTitle);
			fs.unlink(expectedTitle, () => {});
		});
	});


	//////////////////////////////////////////
	// UNSUCCESSFUL                         //
	//////////////////////////////////////////

	it('rejects deleting a non-existing page with delete()', function() {
		return bot.delete('Non-Existing Page8s56df3f2sd624', 'Test Reasons')
			.catch((e) => {
				expect(e).to.be.an.instanceof(MwnError);
				expect(e.message).to.include('missingtitle');
			});
	});

	it('cannot edit a page without providing API URL / Login', function() {
		return new mwn().save('Main Page', '=Some more Wikitext=', 'Test Upload').catch((e) => {
			expect(e).to.be.an.instanceof(MwnError);
			expect(e.message).to.include('No URL');
		});
	});

	it('fails to parse a non-existing page', function() {
		return bot.parseTitle('fswer4536tgrr').catch(err => {
			expect(err.code).to.equal('missingtitle');
		});
	});

	it('rejects to upload a non-existing file with upload()', function() {
		return bot.upload(__dirname + '/mocking/NonExistingImage.png', 'Title', 'Some text').catch((e) => {
			expect(e).to.be.an.instanceof(Error);
			expect(e.message).to.include('ENOENT');
		});
	});

});
