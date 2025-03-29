'use strict';

const { Mwn, expect, sinon, verifyTokenAndSiteInfo } = require('./base/test_base');

const testwiki = require('./mocking/loginCredentials.js');

describe('login', async function () {
	this.timeout(10000);

	it('logs in and gets token & siteinfo', async function () {
		let client = new Mwn();
		return client.login(testwiki.account1).then(async () => {
			expect(client.loggedIn).to.be.true;
			verifyTokenAndSiteInfo(client);
			let userinfo = await client.userinfo();
			expect(userinfo).to.not.have.property('anon');
		});
	});

	it('avoids concurrent logins', async function () {
		let client = new Mwn();
		client.setOptions({ ...testwiki.account1, defaultParams: { assert: 'user' } });
		const login = sinon.spy(client, 'login');
		const loginInternal = sinon.spy(client, 'loginInternal');

		// Both calls will fail due to assert: user and will try to login at the same time
		const [mainPage, serverTime] = await Promise.all([client.read('Main Page'), client.getServerTime()]);

		expect(login).to.have.been.calledTwice;
		expect(loginInternal).to.have.been.calledOnce;
		sinon.restore();
		expect(serverTime).to.be.a('string');
		expect(mainPage).to.be.a('object');

		await client.logout();
		expect(client.loggedIn).to.be.false;
		await client.login();
		expect(client.loggedIn).to.be.true;
	});

	it('logs in when db is lagged despite maxlag parameter', async function () {
		let client = new Mwn({ ...testwiki.account1, retryPause: 100, defaultParams: { maxlag: -1 } });
		await client.login();
		expect(client.loggedIn).to.be.true;
	});

	let bot = new Mwn();
	it('logs in through init()', async function () {
		bot = await Mwn.init(testwiki.account1);
		expect(bot.loggedIn).to.be.true;
		verifyTokenAndSiteInfo(bot);
	});

	it('raises correct error on trying to login without logout', async function () {
		return bot.login().catch((err) => {
			expect(err.info).to.include('Already logged in as');
		});
	});

	it('raises correct error on trying to login while using OAuth', function (done) {
		let client = new Mwn({ ...testwiki.account1, ...testwiki.account1_oauth });
		client.initOAuth();
		client.login().catch((err) => {
			expect(err.info).to.eq(`Cannot use login/logout while using OAuth`);
			done(); // using done() here to test that catch callback gets called
		});
	});

	it('logs out', async function () {
		await bot.logout();
		expect(bot.loggedIn).to.be.false;
		let userinfo = await bot.userinfo();
		expect(userinfo.anon).to.be.true;
	});

	it('logs in again (same bot instance) and even if assert: user is a default option', async function () {
		bot.setDefaultParams({
			assert: 'user',
		});
		await bot.login(); // need a token to be able to log out
		expect(bot.loggedIn).to.be.true;
		verifyTokenAndSiteInfo(bot);
		let userinfo = await bot.userinfo();
		expect(userinfo).to.not.have.property('anon');
		expect(userinfo.name).to.eq(testwiki.account1.username.slice(0, testwiki.account1.username.indexOf('@')));
	});

	it('logs out and logs in to another account (same bot instance)', async function () {
		await bot.logout();

		// Now trying logging in to another account
		await bot.login(testwiki.account2);
		expect(bot.loggedIn).to.be.true;
		let userinfo = await bot.userinfo();
		expect(userinfo).to.not.have.property('anon');
		expect(userinfo.name).to.eq(testwiki.account2.username.slice(0, testwiki.account2.username.indexOf('@')));
	});

	// TODO: add test for two bot instances signed into different wikis
});
