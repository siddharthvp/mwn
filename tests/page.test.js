'use strict';

const { bot, expect, teardown } = require('./base/test_wiki');
const { MwnError } = require('../build/error');

describe('Page', async function () {
	this.timeout(10000);

	let page;

	before('gets site info', function () {
		return bot.getSiteInfo().then(() => {
			// for further tests
			page = new bot.Page('Wp:Requests/Permissions');
		});
	});

	after('logs out', teardown);

	it('resolves title methods on page objects', function () {
		expect(page.toText()).to.equal('Wikipedia:Requests/Permissions');
	});

	it('constructs a page object', function () {
		var title = new bot.Title('wp:Requests/Permissions');
		expect(new bot.Page(title)).to.be.instanceOf(bot.Page);

		var page = new bot.Page('Requests/Permissions', 4);
		expect(page).to.be.instanceOf(bot.Page);
		expect(page.title).to.equal(title.title);
		expect(page.namespace).to.equal(title.namespace);
	});

	it('overrides getTalkPage() and getSubjectPage()', function () {
		var talkpage = page.getTalkPage();
		expect(talkpage).to.be.instanceOf(bot.Page);
		expect(talkpage.getSubjectPage()).to.be.instanceOf(bot.Page);
	});

	it('gets page text', function () {
		return page.text().then((text) => {
			expect(text).to.be.a('string');
		});
	});

	it('gets page categories', function () {
		return new bot.Page('Main Page').categories().then((cats) => {
			expect(cats).to.be.instanceOf(Array);
			expect(cats.length).to.be.gte(1); // check it on testwiki, could change
			expect(cats[0]).to.be.a('string');
		});
	});

	it('evaluates redirect target on non-redirect', function () {
		return page.getRedirectTarget().then((target) => {
			expect(target).to.equal('Wikipedia:Requests/Permissions');
			return page.isRedirect().then((bool) => {
				expect(bool).to.equal(false);
			});
		});
	});

	var page2;

	it('evaluates redirect target', function () {
		page2 = new bot.Page('Wikipedia:PERM');
		return page2.getRedirectTarget((target) => {
			expect(target).to.equal('Wikipedia:Requests/Permissions');
		});
	});

	it('checks if page is a redirect', function () {
		return page2.isRedirect().then(function (bool) {
			expect(bool).to.equal(true);
		});
	});

	it('gets page creator', function () {
		return page.getCreator().then(function (creator) {
			expect(creator).to.equal('Sir Lestaty de Lioncourt');
		});
	});

	it('checks page existence', async function () {
		await expect(page.exists()).to.eventually.equal(true);
		await expect(new bot.Page('werfsd').exists()).to.eventually.equal(false);
	});

	it('gets deleting admin', function () {
		new bot.Page('File:Mwn-0.22011644726991153.png').getDeletingAdmin().then((admin) => {
			expect(admin).to.equal('SD0001');
		});
	});

	it('gets page links', function () {
		return page.links().then((links) => {
			expect(links).to.be.instanceOf(Array);
			expect(links.length).to.be.gte(1);
			expect(links[0]).to.be.a('string');
		});
	});

	it('gets links on non-existing page', async function () {
		await expect(new bot.Page('1239012390e32413').links())
			.to.be.eventually.rejectedWith(MwnError)
			.that.has.property('code')
			.which.equals('missingtitle');
	});

	it('gets page backlinks', function () {
		return page.backlinks().then((backlinks) => {
			expect(backlinks).to.be.instanceOf(Array);
			expect(backlinks.length).to.be.gte(1);
		});
	});

	it('gets backlinks for non-existing page', function () {
		return new bot.Page('29wdijopsk239esijd123').backlinks().then((backlinks) => {
			expect(backlinks).to.be.instanceOf(Array);
			expect(backlinks.length).to.equal(0);
		});
	});

	it('gets page transclusions', function () {
		return page.transclusions().then((transclusions) => {
			expect(transclusions).to.be.instanceOf(Array);
			expect(transclusions.length).to.be.gte(1);
		});
	});

	it('gets transclusions for non-existing page', function () {
		return new bot.Page('29wdijopsk239esijd123').transclusions().then((transclusions) => {
			expect(transclusions).to.be.instanceOf(Array);
			expect(transclusions.length).to.equal(0);
		});
	});

	it('gets page history', function () {
		return page.history().then((history) => {
			expect(history).to.be.instanceOf(Array);
			expect(history).to.be.of.length(50);
			expect(history[0]).to.include.all.keys('revid', 'parentid', 'user', 'timestamp', 'comment');
		});
	});

	it('gets page history using generator', async function () {
		let count = 0;
		for await (let edit of page.historyGen()) {
			expect(edit).to.include.keys(['revid', 'parentid']);
			if (++count > 10) break;
		}
	});

	it('gets page logs', function () {
		return page.logs().then((logs) => {
			expect(logs).to.be.instanceOf(Array);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action', 'timestamp', 'comment');
		});
	});

	it('gets page logs using generator', async function () {
		for await (let event of page.logsGen()) {
			expect(event).to.include.keys(['title', 'type', 'action', 'timestamp']);
		}
	});

	it('gets logs with type=delete', function () {
		return page.logs(null, 2, 'delete').then((logs) => {
			expect(logs).to.be.instanceOf(Array).of.length(2);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action', 'timestamp', 'comment');
			expect(logs[0].type).to.equal('delete');
			expect(logs[1].type).to.equal('delete');
		});
	});

	it('gets logs with type=delete/revision', function () {
		return page.logs(null, 2, 'delete/revision').then((logs) => {
			expect(logs).to.be.instanceOf(Array).of.length(2);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action', 'timestamp', 'comment');
			expect(logs[0].type).to.equal('delete');
			expect(logs[0].action).to.equal('revision');
			expect(logs[1].type).to.equal('delete');
			expect(logs[1].action).to.equal('revision');
		});
	});
});
