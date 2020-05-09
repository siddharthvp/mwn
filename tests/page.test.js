'use strict';

const mwn = require('../src/bot');

const expect = require('chai').expect;

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

describe('Page', async function() {

	var page;

	before('logs in and gets token & namespaceInfo', function(done) {
		this.timeout(7000);
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			expect(bot.csrfToken.endsWith('+\\')).to.be.ok;
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');

			// for further tests
			page = new bot.page('Wp:Requests/Permissions');

			done();
		});
	});

	after('logs out', function(done) {
		this.timeout(4000);
		bot.logout().then(() => done());
	});

	it('page inherits title', function() {
		expect(page.toText()).to.equal('Wikipedia:Requests/Permissions');
	});

	it('categories', function(done) {
		page.categories().then(cats => {
			expect(cats).to.be.instanceOf(Array);
			expect(cats.length).to.be.gte(1); // check it on testwiki, could change
			expect(cats[0].category).to.be.a('string');
			expect(cats[0].sortkey).to.be.a('string');
			done();
		});
	});

	it('links', function(done) {
		page.links().then(links => {
			expect(links).to.be.instanceOf(Array);
			expect(links.length).to.be.gte(1);
			expect(links[0].title).to.be.a('string');
			done();
		});
	});

	it('history', function(done) {
		page.history().then(history => {
			expect(history).to.be.instanceOf(Array);
			expect(history).to.be.of.length(50);
			expect(history[0]).to.include.all.keys('revid', 'parentid', 'user',
				'timestamp', 'comment');
			done();
		});
	});

	it('logs', function(done) {
		page.logs().then(logs => {
			expect(logs).to.be.instanceOf(Array);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action',
				'timestamp','comment');
			done();
		});
	});

	it('logs with type=delete', function(done) {
		page.logs(null, 2, 'delete').then(logs => {
			expect(logs).to.be.instanceOf(Array);
			expect(logs).to.be.of.length(2);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action',
				'timestamp','comment');
			expect(logs[0].type).to.equal('delete');
			expect(logs[1].type).to.equal('delete');
			done();
		});
	});

	it('logs with type=delete/revision', function(done) {
		page.logs(null, 2, 'delete/revision').then(logs => {
			expect(logs).to.be.instanceOf(Array);
			expect(logs).to.be.of.length(2);
			expect(logs[0]).to.include.all.keys('title', 'type', 'action',
				'timestamp','comment');
			expect(logs[0].type).to.equal('delete');
			expect(logs[0].action).to.equal('revision');
			expect(logs[1].type).to.equal('delete');
			expect(logs[1].action).to.equal('revision');
			done();
		});
	});

});