const { Request } = require('../build/core');
const { MwnError } = require('../build/error');

const { expect, mwn } = require('./test_base');
const { bot } = require('./local_wiki');

describe('core', function () {
	describe('Request', function () {
		const makeInstance = (params) => new Request(new mwn(), params, {});

		it('getMethod', () => {
			expect(makeInstance({ action: 'query' }).getMethod()).to.equal('get');
			expect(makeInstance({ action: 'parse', title: 'X' }).getMethod()).to.equal('get');
			expect(makeInstance({ action: 'parse', text: 'X' }).getMethod()).to.equal('post');
			expect(makeInstance({ action: 'edit' }).getMethod()).to.equal('post');
		});

		it('preprocessParams', () => {
			let req = makeInstance({
				action: 'query',
				param1: undefined,
				param2: true,
				param3: false,
				param4: null,
			});
			req.preprocessParams();
			expect(req.apiParams).to.deep.equal({
				action: 'query',
				param2: '1',
				param4: null,
			});
			expect(req.hasLongFields).to.be.false;
		});

		it("doesn't retry on ENOTFOUND rejection", async function () {
			const bot2 = new mwn({ apiUrl: 'https://somewebsite2342978653424.org/w/api.php' });
			// this test relies on no retry taking place since they won't take place within the 2 second timeout
			await expect(bot2.getSiteInfo())
				.to.be.eventually.rejectedWith(Error)
				.that.has.property('code')
				.which.equals('ENOTFOUND');
		});
	});

	describe('Response', function () {

		it('default legacy error format (bc)', async () => {
			await expect(bot.request({ action: 'qwertyuiop' }))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function(error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('info', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('errorformat=html', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'html'}))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function(error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('html', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('errorformat=plaintext', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'plaintext'}))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function(error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('text', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

		it('errorformat=wikitext', async () => {
			await expect(bot.request({ action: 'qwertyuiop', errorformat: 'wikitext'}))
				.to.be.eventually.rejectedWith('badvalue: Unrecognized value for parameter "action": qwertyuiop.')
				.then(function(error) {
					expect(error).to.be.an.instanceOf(MwnError);
					expect(error).to.have.property('code', 'badvalue');
					expect(error).to.have.property('text', 'Unrecognized value for parameter "action": qwertyuiop.');
				});
		});

	});
});
