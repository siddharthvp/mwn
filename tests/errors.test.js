'use strict';

const { bot, bot2, expect, setup, teardown} = require('./local_wiki');

describe('testing for error recoveries', function() {
	this.timeout(10000);

	const testPage = 'SD0001test';

	before('initializes', function () {
		return Promise.all([
			setup().then(() => {
				return bot.save(testPage, 'lorem ipsum', 'Init test page for testing error recoveries');
			}),
			bot2.login()
		]);
	});

	after('logs out', teardown);

	it('recovers from badtoken errors', function() {
		bot.csrfToken = 'invalid-value';
		return bot.edit(testPage, function(rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'testing mwn'
			};
		}).then(edit => {
			expect(edit.result).to.equal('Success');
		});
	});

	it('recovers from session loss failure', async function() {
		bot2.setDefaultParams({ assert: 'user' });
		await bot2.logout();
		return bot2.edit(testPage, function(rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'Test edit after session loss'
			};
		}).then(edit => {
			expect(edit.result).to.equal('Success');
		});
	});

	it('makes large edits (multipart/form-data) after session loss', async function() {
		await bot.logout();
		let text = 'lorem ipsum '.repeat(1000);
		return bot.edit(testPage, () => {
			return {
				text: text,
				summary: 'Test large edit after session loss'
			};
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

	// Test edit conflict recovery logic
	// We need to use a 2nd account as MediaWiki won't consider edits by the same
	// account as edit conflicts
	it('recovers from edit conflicts in edit()', async function () {
		let firsttime = true;
		await bot.edit(testPage, async rev => {
			// The page has been loaded by `bot`,
			// now edit it using `bot2`
			// This should take place only when the function is invoked the first time,
			// edit() calls itself recursively on an editconflict!
			if (firsttime) {
				await bot2.edit(testPage, rev => {
					return {
						text: rev.content.replace(/[a-z]/g, m => Math.random() < 0.5 ? m + m : ''),
						summary: 'trigger edit conflict'
					};
				});
				firsttime = false;
			}
			return {
				text: rev.content.replace(/[a-z]/g, m => Math.random() < 0.5 ? m + m : m),
				summary: 'test edit conflict recovery'
			};
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

});
