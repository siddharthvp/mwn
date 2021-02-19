'use strict';

const { mwn, expect, verifyTokenAndSiteInfo } = require('./test_base');

const oauthCredentials = require('./mocking/loginCredentials.js').account1_oauth;

let bot = new mwn({
	...oauthCredentials
});

bot.initOAuth();

describe('OAuth', async function() {

	it('gets tokens (GET request)', function() {
		return bot.getTokensAndSiteInfo().then(() => {
			verifyTokenAndSiteInfo(bot);
		});
	});

	it('gets a token (POST request)', function() {
		return bot.request({
			action: 'query',
			meta: 'tokens',
			type: 'csrf'
		}, {
			method: 'post'
		}).then(data => {
			expect(data.query.tokens.csrftoken.length).to.be.gt(10);
		});
	});

	it('purges a page (has to be POST request)', function() {
		return bot.purge([11791]).then(function(response) {
			expect(response).to.be.instanceOf(Array);
			expect(response[0].purged).to.equal(true);
		});
	});

	it('gets a token (multipart/form-data POST request)', function() {
		return bot.request({
			action: 'query',
			meta: 'tokens',
			type: 'csrf'
		}, {
			method: 'post',
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then(data => {
			expect(data.query.tokens.csrftoken.length).to.be.gt(10);
		});
	});

	it('gets a page text', function() {
		return bot.request({
			action: 'query',
			titles: 'Main Page'
		}).then(data => {
			expect(data.query.pages[0].title).to.be.a('string');
		});
	});

});
