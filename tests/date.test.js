const { bot, expect} = require('./test_base');

describe('date', async function() {
	
	it('date constructor', function() {
		let mwTs = new bot.date('20120304050607');
		expect(mwTs.getTime()).to.equal(new Date(2012, 2, 4, 5, 6, 7).getTime());

		let mwSig = new bot.date('13:14, 3 August 2017 (UTC)');
		expect(mwSig.getTime()).to.equal(new Date('13:14 3 August 2017 UTC').getTime());

		expect(new bot.date()).to.be.instanceOf(Date);

	});

	it('formats dates', function() {
		let date = new bot.date('2012-05-09');
		expect(date.format('YYYY-MM-DD[T]HH:mm:ss[Z]')).to.equal('2012-05-09T00:00:00Z');
		expect(date.format('YYYY-[MM]-DD[T]HH:mm:ss[Z]')).to.equal('2012-MM-09T00:00:00Z');
	});

	it('adds and subtracts dates', function() {
		let date = new bot.date('2012-08-09');
		date.add(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-10').getDate());
		date.subtract(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-09').getDate());

		date.add(2, 'days');
		expect(date.getDate()).to.equal(new Date('2012-08-11').getDate());
	});

});