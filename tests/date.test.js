const { mwn, expect } = require('./base/test_base');

// Includes some tests copied from https://github.com/wikimedia-gadgets/twinkle/blob/master/tests/morebits.date.js

const bot = new mwn();
describe('date', async function () {
	it('date constructor', function () {
		let mwTs = new bot.Date('20120304050607');
		expect(mwTs.getTime()).to.equal(
			// MW timestamps are UTC
			new Date(Date.UTC(2012, 2, 4, 5, 6, 7)).getTime()
		);

		let mwSig = new bot.Date('13:14, 3 August 2017 (UTC)');
		expect(mwSig.getTime()).to.equal(new Date('13:14 3 August 2017 UTC').getTime());

		expect(new bot.Date()).to.be.instanceOf(Date);
	});

	it('isBefore and isAfter', function () {
		expect(new bot.Date('2018-09-12').isValid()).to.eq(true);
		expect(new bot.Date('Bazinga').isValid()).to.eq(false);
		expect(new bot.Date('2012-12-03').isBefore(new Date())).to.eq(true);
		expect(new bot.Date('2022-12-03').isAfter(new Date())).to.eq(false);
	});

	it('custom get methods', function () {
		let date = new bot.Date('16:26, 7 November 2020 (UTC)');
		expect(date.getUTCDayName()).to.eq('Saturday');
		expect(date.getUTCDayNameAbbrev()).to.eq('Sat');
		expect(date.getUTCMonthName()).to.eq('November');
		expect(date.getUTCMonthNameAbbrev()).to.eq('Nov');
	});

	it('formats dates', function () {
		let date = new bot.Date('2012-05-09');
		expect(date.format('YYYY-MM-DD[T]HH:mm:ss[Z]')).to.equal('2012-05-09T00:00:00Z');
		expect(date.format('YYYY-[MM]-DD[T]HH:mm:ss[Z]')).to.equal('2012-MM-09T00:00:00Z');

		expect(date.toString()).to.equal('9 May 2012, 00:00:00 (UTC)');
	});

	it('adds and subtracts dates', function () {
		let date = new bot.Date('2012-08-09');
		date.add(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-10').getDate());
		date.subtract(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-09').getDate());

		date.add(2, 'days');
		expect(date.getDate()).to.equal(new Date('2012-08-11').getDate());
	});

	it('calendar', function () {
		let date = new bot.Date('16:26, 7 November 2020 (UTC)');
		let now = Date.now();
		expect(date.calendar('utc')).to.eq('2020-11-07');
		expect(date.calendar(600)).to.eq('2020-11-08');
		expect(new bot.Date(now).calendar('utc')).to.eq('Today at ' + new bot.Date(now).format('h:mm A', 'utc'));
		expect(new bot.Date(now).subtract(1, 'day').calendar('utc')).to.eq(
			'Yesterday at ' + new bot.Date(now).format('h:mm A', 'utc')
		);
	});

	it('interprets locale data correctly', function () {
		expect(bot.Date.getDayName(1)).to.eq('Sunday');
		expect(bot.Date.getDayNameAbbrev(1)).to.eq('Sun');
		expect(bot.Date.getMonthName(1)).to.eq('January');
		expect(bot.Date.getMonthNameAbbrev(1)).to.eq('Jan');
	});
});
