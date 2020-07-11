'use strict';

const { mwn, expect, assert } = require('./test_base');

const oauthCredentials = require('./mocking/loginCredentials.js').valid_oauth;

let bot = new mwn({
	...oauthCredentials
});

bot.initOAuth();

describe('get token', async function() {

	it('gets a token (GET request)', function() {
		return bot.getTokens().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			expect(bot.csrfToken.length).to.be.gt(5);
			assert(bot.csrfToken.endsWith('+\\'));
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
			expect(data.query.tokens.csrftoken.length).to.be.gt(5);
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
			expect(data.query.tokens.csrftoken.length).to.be.gt(5);
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