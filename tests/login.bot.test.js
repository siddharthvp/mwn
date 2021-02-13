'use strict';

const { mwn, expect } = require('./test_base');

const testwiki = require('./mocking/loginCredentials.js');

describe('login', async function() {
	this.timeout(10000);

	it('successfully logs in and gets token & siteinfo', async function() {
		let client = new mwn();
		return client.login(testwiki.account1).then(async () => {
			expect(client.loggedIn).to.be.true;
			expect(client.csrfToken).to.be.a('string');
			expect(client.csrfToken).to.be.of.length.greaterThan(5);
			expect(client.title.nameIdMap).to.include.all.keys('project', 'user');
			let userinfo = await client.userinfo();
			expect(userinfo).to.not.have.property('anon');
		});
	});

	let bot = new mwn();
	it('successfully logs in through init', async function() {
		bot = await mwn.init(testwiki.account1);
		expect(bot.loggedIn).to.be.true;
		expect(bot.csrfToken).to.be.a('string');
		expect(bot.csrfToken).to.be.of.length.greaterThan(5); // csrftoken longer than `+\` for non-anons
	});

	it('raises correct error on trying to login without logout', async function() {
		return bot.login().catch(err => {
			expect(err.info).to.include('Already logged in as');
		});
	});

	it('raises correct error on trying to login while using OAuth', async function() {
		let client = new mwn({...testwiki.account1, ...testwiki.account1_oauth});
		client.initOAuth();
		return client.login().catch(err => {
			expect(err.info).to.eq(`Cannot use login/logout while using OAuth`);
		});
	});

	it('successfully logs out', async function() {
		await bot.logout();
		expect(bot.loggedIn).to.be.false;
		let userinfo = await bot.userinfo();
		expect(userinfo.anon).to.be.true;
	});

	it('successfully logs in again (same bot instance) and even if assert: user is a default option', async function() {
		bot.setDefaultParams({
			assert: 'user'
		});
		await bot.login(); // need a token to be able to log out
		expect(bot.loggedIn).to.be.true;
		expect(bot.csrfToken).to.be.a('string');
		expect(bot.csrfToken.endsWith('+\\')).to.be.true;
		let userinfo = await bot.userinfo();
		expect(userinfo).to.not.have.property('anon');
		expect(userinfo.name).to.eq(testwiki.account1.username.slice(0, testwiki.account1.username.indexOf('@')));
	});

	it('logs out and logs in to another account (same bot instance)', async function() {
		await bot.logout();

		// Now trying logging in to another account
		await bot.login(testwiki.account2);
		expect(bot.loggedIn).to.be.true;
		let userinfo = await bot.userinfo();
		expect(userinfo).to.not.have.property('anon');
		expect(userinfo.name).to.eq(testwiki.account2.username.slice(0, testwiki.account2.username.indexOf('@')));
	});

});
