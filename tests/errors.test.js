'use strict';

const { bot, bot2, expect, loginBefore, logoutAfter} = require('./test_base');


describe('testing for error recoveries', function() {
	this.timeout(10000);

	before('initializes', function () {
		loginBefore(); // initialize `bot` OAuth
		return bot2.login();
	});

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
		bot2.setDefaultParams({ assert: 'user' });
		await bot2.logout();
		return bot2.edit('SD0001test', function(rev) {
			return {
				text: rev.content + '\n\nappended text',
				summary: 'testing mwn'
			};
		}).then(edit => {
			expect(edit.result).to.equal('Success');
		});
	});

	it('makes large edits (multipart/form-data) after session loss', async function() {
		await bot2.logout();
		let text = 'lorem ipsum '.repeat(1000);
		return bot.edit('SD0001test', () => {
			return {
				text: text,
				summary: 'Test large edit (mwn)'
			};
		}).then(response => {
			expect(response.result).to.equal('Success');
		});
	});

	// Test edit conflict recovery logic
	// We need to use a 2nd account as MediaWiki won't consider edits by the same
	// account as edit conflicts
	let firsttime = true;
	it('recovers from edit conflicts in edt()', async function () {
		await bot.edit('SD0001test', async rev => {
			// The page has been loaded by `bot`,
			// now edit it using `bot2`
			// This should take place only when the function is invoked the first time,
			// edit() calls itself recursively on an editconflict!
			if (firsttime) {
				await bot2.edit('SD0001test', rev => {
					return {
						text: rev.content.replace(/[a-z]/g, m => Math.random() < 0.2 ? m + m : ''),
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
