const { Mwn, bot, expect, setup, teardown } = require('./base/local_wiki');

describe('user class: write methods', async function () {
	this.timeout(5000);

	before('setup', setup);
	after('teardown', teardown);

	let u = new bot.User('Wikiuser2');

	it('sends talk page message', function () {
		return u.sendMessage('Hi', 'Testing from mwn. ~~~~').then((data) => {
			expect(data).to.be.an('object').which.has.property('result').that.equals('Success');
		});
	});

	it('sends email', function () {
		return expect(u.email('Subject', 'body'))
			.to.be.eventually.rejectedWith(Mwn.Error)
			.with.property('code')
			.that.equals('noemailtext');
	});

	it('blocks user', function () {
		return u.block().then((data) => {
			expect(data)
				.to.be.an('object')
				.that.includes.keys('user', 'userID', 'reason', 'anononly', 'nocreate', 'partial');
			expect(data.user).to.equal('Wikiuser2');
		});
	});

	it('unblocks user', function () {
		return u.unblock().then((data) => {
			expect(data).to.be.an('object').that.includes.keys('user', 'id', 'userid', 'reason');
			expect(data.user).to.equal('Wikiuser2');
		});
	});
});
