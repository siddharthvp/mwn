const { bot, expect } = require('./local_wiki');

// Includes some tests copied from https://github.com/wikimedia-gadgets/twinkle/blob/master/tests/morebits.date.js

describe('date', async function () {
	it('date constructor', function () {
		let mwTs = new bot.date('20120304050607');
		expect(mwTs.getTime()).to.equal(new Date(2012, 2, 4, 5, 6, 7).getTime());

		let mwSig = new bot.date('13:14, 3 August 2017 (UTC)');
		expect(mwSig.getTime()).to.equal(new Date('13:14 3 August 2017 UTC').getTime());

		expect(new bot.date()).to.be.instanceOf(Date);
	});

	it('isBefore and isAfter', function () {
		expect(new bot.date('2018-09-12').isValid()).to.eq(true);
		expect(new bot.date('Bazinga').isValid()).to.eq(false);
		expect(new bot.date('2012-12-03').isBefore(new Date())).to.eq(true);
		expect(new bot.date('2022-12-03').isAfter(new Date())).to.eq(true);
	});

	it('custom get methods', function () {
		let date = new bot.date('16:26, 7 November 2020 (UTC)');
		expect(date.getUTCDayName()).to.eq('Saturday');
		expect(date.getUTCDayNameAbbrev()).to.eq('Sat');
		expect(date.getUTCMonthName()).to.eq('November');
		expect(date.getUTCMonthNameAbbrev()).to.eq('Nov');
	});

	it('formats dates', function () {
		let date = new bot.date('2012-05-09');
		expect(date.format('YYYY-MM-DD[T]HH:mm:ss[Z]')).to.equal('2012-05-09T00:00:00Z');
		expect(date.format('YYYY-[MM]-DD[T]HH:mm:ss[Z]')).to.equal('2012-MM-09T00:00:00Z');
	});

	it('adds and subtracts dates', function () {
		let date = new bot.date('2012-08-09');
		date.add(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-10').getDate());
		date.subtract(1, 'day');
		expect(date.getDate()).to.equal(new Date('2012-08-09').getDate());

		date.add(2, 'days');
		expect(date.getDate()).to.equal(new Date('2012-08-11').getDate());
	});

	it('calendar', function () {
		let date = new bot.date('16:26, 7 November 2020 (UTC)');
		let now = Date.now();
		expect(date.calendar('utc')).to.eq('2020-11-07');
		expect(date.calendar(600)).to.eq('2020-11-08');
		expect(new bot.date(now).calendar('utc')).to.eq('Today at ' + new bot.date(now).format('h:mm A', 'utc'));
		expect(new bot.date(now).subtract(1, 'day').calendar('utc')).to.eq(
			'Yesterday at ' + new bot.date(now).format('h:mm A', 'utc'),
		);
	});

	it('interprets locale data correctly', function () {
		expect(bot.date.getDayName(1)).to.eq('Sunday');
		expect(bot.date.getDayNameAbbrev(1)).to.eq('Sun');
		expect(bot.date.getMonthName(1)).to.eq('January');
		expect(bot.date.getMonthNameAbbrev(1)).to.eq('Jan');
	});
});
