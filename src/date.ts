import type { Mwn } from './bot';
import { Unbinder } from './wikitext';

/**
 * Wrapper around the native JS Date() for ease of
 * handling dates, as well as a constructor that
 * can parse MediaWiki dating formats.
 */
export interface MwnDate extends Date {
	isValid(): boolean;
	isBefore(date: Date | MwnDate): boolean;
	isAfter(date: Date | MwnDate): boolean;
	getUTCMonthName(): string;
	getUTCMonthNameAbbrev(): string;
	getMonthName(): string;
	getMonthNameAbbrev(): string;
	getUTCDayName(): string;
	getUTCDayNameAbbrev(): string;
	getDayName(): string;
	getDayNameAbbrev(): string;

	/**
	 * Add a given number of minutes, hours, days, months or years to the date.
	 * This is done in-place. The modified date object is also returned, allowing chaining.
	 * @param {number} number - should be an integer
	 * @param {string} unit
	 * @throws {Error} if invalid or unsupported unit is given
	 * @returns {MwnDate}
	 */
	add(number: number, unit: timeUnit): MwnDate;

	/**
	 * Subtracts a given number of minutes, hours, days, months or years to the date.
	 * This is done in-place. The modified date object is also returned, allowing chaining.
	 * @param {number} number - should be an integer
	 * @param {string} unit
	 * @throws {Error} if invalid or unsupported unit is given
	 * @returns {MwnDate}
	 */
	subtract(number: number, unit: timeUnit): MwnDate;

	/**
	 * Formats the date into a string per the given format string.
	 * Replacement syntax is a subset of that in moment.js:
	 *
	 * | Syntax | Output |
	 * |--------|--------|
	 * | H | Hours (24-hour) |
	 * | HH | Hours (24-hour, padded to 2 digits) |
	 * | h | Hours (12-hour) |
	 * | hh | Hours (12-hour, padded to 2 digits) |
	 * | A | AM or PM |
	 * | m | Minutes |
	 * | mm | Minutes (padded to 2 digits) |
	 * | s | Seconds |
	 * | ss | Seconds (padded to 2 digits) |
	 * | d | Day number of the week (Sun=0) |
	 * | ddd | Abbreviated day name |
	 * | dddd | Full day name |
	 * | D | Date |
	 * | DD | Date (padded to 2 digits) |
	 * | M | Month number (1-indexed) |
	 * | MM | Month number (1-indexed, padded to 2 digits) |
	 * | MMM | Abbreviated month name |
	 * | MMMM | Full month name |
	 * | Y | Year |
	 * | YY | Final two digits of year (20 for 2020, 42 for 1942) |
	 * | YYYY | Year (same as `Y`) |
	 *
	 * @param {string} formatstr
	 * @param {(string|number)} [zone=utc] - 'system' (for system-default time zone),
	 * 'utc' (for UTC), or specify a time zone as number of minutes past UTC.
	 * @returns {string}
	 */
	format(formatstr: string, zone?: number | 'utc' | 'system'): string;

	/**
	 * Gives a readable relative time string such as "Yesterday at 6:43 PM" or "Last Thursday at 11:45 AM".
	 * Similar to calendar in moment.js, but with time zone support.
	 * @param {(string|number)} [zone=system] - 'system' (for browser-default time zone),
	 * 'utc' (for UTC), or specify a time zone as number of minutes past UTC
	 * @returns {string}
	 */
	calendar(zone?: number | 'utc' | 'system'): string;
}
export interface MwnDateStatic {
	/**
	 * Create a date object. MediaWiki timestamp format is also acceptable,
	 * in addition to everything that JS Date() accepts.
	 */
	new (...args: any[]): MwnDate;
	/**
	 * Get month name from month number (1-indexed)
	 */
	getMonthName(monthNum: number): string;
	/**
	 * Get abbreviated month name from month number (1-indexed)
	 */
	getMonthNameAbbrev(monthNum: number): string;
	/**
	 * Get day name from day number (1-indexed, starting from Sunday)
	 */
	getDayName(dayNum: number): string;
	/**
	 * Get abbreviated day name from day number (1-indexed, starting from Sunday)
	 */
	getDayNameAbbrev(dayNum: number): string;

	localeData: any;

	/**
	 * Customize language used for day and month names. This fetches
	 * the data from MediaWiki API. By default, it is English.
	 * @param lang - Defaults to the content language of the wiki the bot
	 * is logged into.
	 */
	populateLocaleData(lang?: string): Promise<void>;
}

export default function (bot: Mwn) {
	class XDate extends Date implements MwnDate {
		constructor(...args: ConstructorParameters<DateConstructor>);
		constructor(timestamp: string);
		constructor(...args: any[]) {
			if (args.length === 1 && typeof args[0] === 'string') {
				// parse MediaWiki format: YYYYMMDDHHmmss
				if (/^\d{14}$/.test(args[0])) {
					let match = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(args[0]);
					let dateParts = match.slice(1).map((e) => parseInt(e));
					super(
						Date.UTC(
							dateParts[0],
							dateParts[1] - 1, // fix month
							dateParts[2],
							dateParts[3],
							dateParts[4],
							dateParts[5]
						)
					);
				} else {
					// Attempt to remove a comma and paren-wrapped timezone, to get MediaWiki
					// signature timestamps to parse. Firefox (at least in 75) seems to be
					// okay with the comma, though
					args[0] = args[0].replace(/(\d\d:\d\d),/, '$1').replace(/\(UTC\)/, 'UTC');
					super(args[0]);
				}
			} else {
				// @ts-ignore
				super(...args);
			}

			// Still no?
			if (isNaN(this.getTime()) && !bot.options.suppressInvalidDateWarning) {
				console.warn('Invalid initialisation of MwnDate object: ', args);
			}
		}

		isValid(): boolean {
			return !isNaN(this.getTime());
		}

		isBefore(date: Date | MwnDate): boolean {
			return this.getTime() < date.getTime();
		}

		isAfter(date: Date | MwnDate): boolean {
			return this.getTime() > date.getTime();
		}

		getUTCMonthName(): string {
			return XDate.localeData.months[this.getUTCMonth()];
		}

		getUTCMonthNameAbbrev(): string {
			return XDate.localeData.monthsShort[this.getUTCMonth()];
		}

		getMonthName(): string {
			return XDate.localeData.months[this.getMonth()];
		}

		getMonthNameAbbrev(): string {
			return XDate.localeData.monthsShort[this.getMonth()];
		}

		getUTCDayName(): string {
			return XDate.localeData.days[this.getUTCDay()];
		}

		getUTCDayNameAbbrev(): string {
			return XDate.localeData.daysShort[this.getUTCDay()];
		}

		getDayName(): string {
			return XDate.localeData.days[this.getDay()];
		}

		getDayNameAbbrev(): string {
			return XDate.localeData.daysShort[this.getDay()];
		}

		/** @inheritDoc */
		add(number: number, unit: timeUnit): XDate {
			// @ts-ignore
			let unitNorm = unitMap[unit] || unitMap[unit + 's']; // so that both singular and  plural forms work
			if (unitNorm) {
				// @ts-ignore
				this['set' + unitNorm](this['get' + unitNorm]() + number);
				return this;
			}
			throw new Error('Invalid unit "' + unit + '": Only ' + Object.keys(unitMap).join(', ') + ' are allowed.');
		}

		/** @inheritDoc */
		subtract(number: number, unit: timeUnit): XDate {
			return this.add(-number, unit);
		}

		/** @inheritDoc */
		format(formatstr: string, zone: number | 'utc' | 'system' = 'utc'): string {
			if (!this.isValid()) {
				return ''; // avoid bogus NaNs in output
			}
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			let udate: XDate = this;
			// create a new date object that will contain the date to display as system time
			if (!zone || zone === 'utc') {
				udate = new XDate(this.getTime()).add(this.getTimezoneOffset(), 'minutes');
			} else if (typeof zone === 'number') {
				// convert to utc, then add the utc offset given
				udate = new XDate(this.getTime()).add(this.getTimezoneOffset() + zone, 'minutes');
			}

			const pad = function (num: number) {
				return String(num < 10 ? '0' + num : num);
			};
			const h24 = udate.getHours(),
				m = udate.getMinutes(),
				s = udate.getSeconds();
			const D = udate.getDate(),
				M = udate.getMonth() + 1,
				Y = udate.getFullYear();
			const h12 = h24 % 12 || 12,
				amOrPm = h24 >= 12 ? 'PM' : 'AM';
			const replacementMap = {
				HH: pad(h24),
				H: h24,
				hh: pad(h12),
				h: h12,
				A: amOrPm,
				mm: pad(m),
				m: m,
				ss: pad(s),
				s: s,
				dddd: udate.getDayName(),
				ddd: udate.getDayNameAbbrev(),
				d: udate.getDay(),
				DD: pad(D),
				D: D,
				MMMM: udate.getMonthName(),
				MMM: udate.getMonthNameAbbrev(),
				MM: pad(M),
				M: M,
				YYYY: Y,
				YY: pad(Y % 100),
				Y: Y,
			};

			let unbinder = new Unbinder(formatstr); // escape stuff between [...]
			unbinder.unbind('\\[', '\\]');
			unbinder.text = unbinder.text.replace(
				/* Regex notes:
				 * d(d{2,3})? matches exactly 1, 3 or 4 occurrences of 'd' ('dd' is treated as a double match of 'd')
				 * Y{1,2}(Y{2})? matches exactly 1, 2 or 4 occurrences of 'Y'
				 */
				/H{1,2}|h{1,2}|m{1,2}|s{1,2}|d(d{2,3})?|D{1,2}|M{1,4}|Y{1,2}(Y{2})?|A/g,
				function (match) {
					// @ts-ignore
					return replacementMap[match];
				}
			);
			return unbinder.rebind().replace(/\[(.*?)\]/g, '$1');
		}

		/** @inheritDoc */
		calendar(zone: number | 'utc' | 'system' = 'utc'): string {
			// Zero out the hours, minutes, seconds and milliseconds - keeping only the date;
			// find the difference. Note that setHours() returns the same thing as getTime().
			const dateDiff = (new Date().setHours(0, 0, 0, 0) - new Date(this).setHours(0, 0, 0, 0)) / 8.64e7;
			switch (true) {
				case dateDiff === 0:
					return this.format(XDate.localeData.relativeTimes.thisDay, zone);
				case dateDiff === 1:
					return this.format(XDate.localeData.relativeTimes.prevDay, zone);
				case dateDiff > 0 && dateDiff < 7:
					return this.format(XDate.localeData.relativeTimes.pastWeek, zone);
				case dateDiff === -1:
					return this.format(XDate.localeData.relativeTimes.nextDay, zone);
				case dateDiff < 0 && dateDiff > -7:
					return this.format(XDate.localeData.relativeTimes.thisWeek, zone);
				default:
					return this.format(XDate.localeData.relativeTimes.other, zone);
			}
		}

		toString(): string {
			return this.format('D MMMM YYYY, HH:mm:ss (UTC)', 'utc');
		}

		static localeData = {
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			],
			monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			relativeTimes: {
				thisDay: '[Today at] h:mm A',
				prevDay: '[Yesterday at] h:mm A',
				nextDay: '[Tomorrow at] h:mm A',
				thisWeek: 'dddd [at] h:mm A',
				pastWeek: '[Last] dddd [at] h:mm A',
				other: 'YYYY-MM-DD',
			},
		};

		/** @inheritDoc */
		static async populateLocaleData(lang?: string) {
			const monthsKeys =
				'january|february|march|april|may_long|june|july|august|september|october|november|december'.split('|');
			const monthsShortKeys = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec'.split('|');
			const daysKeys = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday'.split('|');
			const daysShortKeys = 'sun|mon|tue|wed|thu|fri|sat'.split('|');

			const messages = await bot.getMessages([...monthsKeys, ...monthsShortKeys, ...daysKeys, ...daysShortKeys], {
				amlang: lang || 'content',
			});
			this.localeData.months = monthsKeys.map((key) => messages[key]);
			this.localeData.monthsShort = monthsShortKeys.map((key) => messages[key]);
			this.localeData.days = daysKeys.map((key) => messages[key]);
			this.localeData.daysShort = daysShortKeys.map((key) => messages[key]);
		}

		/** @inheritDoc */
		static getMonthName(monthNum: number): string {
			return XDate.localeData.months[monthNum - 1];
		}

		/** @inheritDoc */
		static getMonthNameAbbrev(monthNum: number): string {
			return XDate.localeData.monthsShort[monthNum - 1];
		}

		/** @inheritDoc */
		static getDayName(dayNum: number): string {
			return XDate.localeData.days[dayNum - 1];
		}

		/** @inheritDoc */
		static getDayNameAbbrev(dayNum: number): string {
			return XDate.localeData.daysShort[dayNum - 1];
		}
	}

	return XDate as MwnDateStatic;
}

// mapping time units with getter/setter function names for add and subtract
const unitMap = {
	seconds: 'Seconds',
	minutes: 'Minutes',
	hours: 'Hours',
	days: 'Date',
	months: 'Month',
	years: 'FullYear',
};

// plural or singular keys of unitMap
export type timeUnit = keyof typeof unitMap | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
