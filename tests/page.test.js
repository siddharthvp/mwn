'use strict';

const { bot, expect, teardown } = require('./test_wiki');

describe('Page', async function () {
	this.timeout(10000);

	let page;

	before('gets site info', function () {
		return bot.getSiteInfo().then(() => {
			// for further tests
			page = new bot.page('Wp:Requests/Permissions');
		});
	});

	after('logs out', teardown);

	it('page inherits title', function () {
		expect(page.toText()).to.equal('Wikipedia:Requests/Permissions');
	});

	it('constructor', function () {
		var title = new bot.title('wp:Requests/Permissions');
		expect(new bot.page(title)).to.be.instanceOf(bot.page);

		var page = new bot.page('Requests/Permissions', 4);
		expect(page).to.be.instanceOf(bot.page);
		expect(page.title).to.equal(title.title);
		expect(page.namespace).to.equal(title.namespace);
	});

	it('getTalkPage and getSubjectPage are overridden', function () {
		var talkpage = page.getTalkPage();
		expect(talkpage).to.be.instanceOf(bot.page);
		expect(talkpage.getSubjectPage()).to.be.instanceOf(bot.page);
	});

	it('categories', function () {
		return page.categories().then((cats) => {
			expect(cats).to.be.instanceOf(Array);
			expect(cats.length).to.be.gte(1); // check it on testwiki, could change
			expect(cats[0].category).to.be.a('string');
			expect(cats[0].sortkey).to.be.a('string');
		});
	});

	it('getRedirectTarget on non-redirect', function () {
		return page.getRedirectTarget().then((target) => {
			expect(target).to.equal('Wikipedia:Requests/Permissions');
			return page.isRedirect().then((bool) => {
				expect(bool).to.equal(false);
			});
		});
	});

	var page2;

	it('getRedirectTarget and isRedirect on redirect', function () {
		page2 = new bot.page('Wikipedia:PERM');
		return page2.getRedirectTarget((target) => {
			expect(target).to.equal('Wikipedia:Requests/Permissions');
		});
	});

	it('isRedirect on redirect', function () {
		return page2.isRedirect().then(function (bool) {
			expect(bool).to.equal(true);
		});
	});

	it('getCreator', function () {
		return page.getCreator().then(function (creator) {
			expect(creator).to.equal('Sir Lestaty de Lioncourt');
		});
	});

	it('exists', async function () {
		await expect(page.exists()).to.eventually.equal(true);
		await expect(new bot.page('werfsd').exists()).to.eventually.equal(false);
	});

	it('getDeletingAdmin', function () {
		new bot.page('File:Mwn-0.22011644726991153.png').getDeletingAdmin().then((admin) => {
			expect(admin).to.equal('SD0001');
		});
	});

	it('links', function () {
		return page.links().then((links) => {
			expect(links).to.be.instanceOf(Array);
			expect(links.length).to.be.gte(1);
			expect(links[0].title).to.be.a('string');
		});
	});

	it('backlinks', function () {
		return page.backlinks().then((backlinks) => {
			expect(backlinks).to.be.instanceOf(Array);
			expect(backlinks.length).to.be.gte(1);
		});
	});

	it('transclusions', function () {
		return page.transclusions().then((transclusions) => {
			expect(transclusions).to.be.instanceOf(Array);
			expect(transclusions.length).to.be.gte(1);
		});
	});

	it('history', function () {
		return page.history().then((history) => {
			expect(history).to.be.instanceOf(Array);
			expect(history).to.be.of.length(50);
			expect(history[0]).to.include.all.keys('revid', 'parentid', 'user', 'timestamp', 'comment');
		});
	});

	it('historyGen', async function () {
		let count = 0;
		for await (let edit of page.historyGen()) {
			expect(edit).to.include.keys(['revid', 'parentid']);
			if (++count > 10) break;
		}
	});

	it('logs', function () {
		return page.logs().then((logs) => {
			expect(logs).to.be.instanceOf(Array);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action', 'timestamp', 'comment');
		});
	});

	it('logsGen', async function () {
		for await (let event of page.logsGen()) {
			expect(event).to.include.keys(['title', 'type', 'action', 'timestamp']);
		}
	});

	it('logs with type=delete', function () {
		return page.logs(null, 2, 'delete').then((logs) => {
			expect(logs).to.be.instanceOf(Array).of.length(2);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action', 'timestamp', 'comment');
			expect(logs[0].type).to.equal('delete');
			expect(logs[1].type).to.equal('delete');
		});
	});

	it('logs with type=delete/revision', function () {
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
