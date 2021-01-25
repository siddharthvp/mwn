'use strict';

const { mwn, expect, assert } = require('./test_base');

const {account1, account2, account1_oauth} = require('./mocking/loginCredentials.js');

describe('login', async function() {
	this.timeout(10000);

	it('successfully logs in and gets token', async function() {
		let client = new mwn();
		return client.loginGetToken(account1).then(async () => {
			expect(client.loggedIn).to.be.true;
			expect(client.csrfToken).to.be.a('string');
			assert(client.csrfToken.endsWith('+\\'));
			let userinfo = await client.userinfo();
			expect(userinfo.anon).to.be.undefined;
		});
	});

	let bot = new mwn();
	it('successfully logs in through init', async function() {
		bot = await mwn.init(account1);
		expect(bot.loggedIn).to.be.true;
		expect(bot.csrfToken).to.be.a('string');
		expect(bot.csrfToken.length).to.be.gte(5); // csrftoken longer than `+\` for non-anons
	});

	it('raises correct error on trying to login without logout', async function() {
		return bot.login().catch(err => {
			expect(err.info).to.include('Already logged in as');
		});
	});

	it('raises correct error on trying to login while using OAuth', async function() {
		let client = new mwn({...account1, ...account1_oauth});
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
		await bot.loginGetToken(); // need a token to be able to log out
		expect(bot.loggedIn).to.be.true;
		expect(bot.csrfToken).to.be.a('string');
		assert(bot.csrfToken.endsWith('+\\'));
		let userinfo = await bot.userinfo();
		expect(userinfo.anon).to.be.undefined;
		expect(userinfo.name).to.eq(account1.username.slice(0, account1.username.indexOf('@')));
	});

	it('logs out and logs in to another account (same bot instance)', async function() {
		await bot.logout();

		// Now trying logging in to another account
		await bot.login(account2);
		expect(bot.loggedIn).to.be.true;
		let userinfo = await bot.userinfo();
		expect(userinfo.anon).to.be.undefined;
		expect(userinfo.name).to.eq(account2.username.slice(0, account2.username.indexOf('@')));
	});

});
