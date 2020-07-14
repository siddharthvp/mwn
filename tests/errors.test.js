'use strict';

const { bot, expect, loginBefore, logoutAfter} = require('./test_base');


describe('testing for error recoveries', function() {
	this.timeout(10000);

	before('logs in and gets token & namespaceInfo', loginBefore);

	after('logs out', logoutAfter);

	it('recovers from badtoken errors', function() {
		bot.csrfToken = 'invalid-value';
		return bot.edit('SD0001test', function(rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'testing mwn'
			};
		}).then(edit => {
			expect(edit.result).to.equal('Success');
		});
	});

	it('recovers from session loss failure', async function() {
		await bot.logout();
		bot.setDefaultParams({ assert: 'user' });
		return bot.edit('SD0001test', function(rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'testing mwn'
			};
		}).then(edit => {
			expect(edit.result).to.equal('Success');
		});
	});

	it('makes large edits (multipart/form-data) after session loss', async function() {
		await bot.logout();
		var text = 'lorem ipsum '.repeat(1000);
		return bot.edit('SD0001test', () => {
			return {
				text: text,
				summary: 'Test large edit (mwn)'
			};
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

});
