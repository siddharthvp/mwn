'use strict';

const { bot, expect, setup, teardown } = require('./base/test_wiki');

describe('User', async function () {
	this.timeout(7000);

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);

	it('gets user contribs', function () {
		let u = new bot.user('SD0001');
		return u.contribs().then((response) => {
			expect(response).to.be.instanceOf(Array).of.length.greaterThan(500);
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
		});
	});

	it('gets user logs', async function () {
		let u = new bot.user('SD0001');
		return u.logs().then((response) => {
			expect(response).to.be.instanceOf(Array).of.length.greaterThan(10);
			expect(response[0].logid).to.be.a('number');
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
		});
	});

	it('contribsGen and logsGen', async function () {
		let u = new bot.user('SD0001');
		let count = 0;
		for await (let item of u.contribsGen()) {
			expect(item).to.have.property('user').that.equals('SD0001');
			if (++count > 10) break;
		}

		count = 0;
		for await (let item of u.logsGen()) {
			expect(item).to.have.property('user').that.equals('SD0001');
			if (++count > 10) break;
		}
	});

	it('userpage and talkpage', function () {
		let u = new bot.user('SD0001');
		expect(u.userpage).to.be.instanceOf(bot.page).that.has.property('title').which.equals('SD0001');
		expect(u.userpage.namespace).to.equal(2);
		expect(u.talkpage).to.be.instanceOf(bot.page).that.has.property('title').which.equals('SD0001');
		expect(u.talkpage.namespace).to.equal(3);
	});

	it('info and globalinfo', async function () {
		let u = new bot.user('SD0001');
		let info = await u.info();
		expect(info).to.include.keys('userid', 'editcount', 'groups', 'rights');
		let globalinfo = await u.globalinfo();
		expect(globalinfo).to.include.keys('home', 'id', 'name');
	});
});
