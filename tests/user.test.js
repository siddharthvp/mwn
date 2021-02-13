'use strict';

const { bot, expect, loginBefore, logoutAfter} = require('./test_wiki');

describe('User', async function() {
	this.timeout(7000);

	before('logs in and gets token & namespaceInfo', loginBefore);
	after('logs out', logoutAfter);

	it('gets user contribs', function(done) {
		var u = new bot.user('SD0001');
		u.contribs().then(response => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.be.gt(500);
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
			done();
		});
	});

	it('gets user logs', function(done) {
		var u = new bot.user('SD0001');
		u.logs().then(response => {
			expect(response).to.be.instanceOf(Array);
			expect(response.length).to.be.gt(10);
			expect(response[0].logid).to.be.a('number');
			expect(response[0].user).to.equal('SD0001');
			expect(response[0].title).to.be.a('string');
			done();
		});
	});

	it('userpage', function() {
		var u = new bot.user('SD0001');
		expect(u.userpage).to.be.instanceOf(bot.page);
		expect(u.userpage.namespace).to.equal(2);
	});

});
