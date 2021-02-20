import type {mwn} from "./bot";

/**
 * Wrapper around the native JS Date() for ease of
 * handling dates, as well as a constructor that
 * can parse MediaWiki dating formats.
 */

export interface MwnDateStatic {
	new (...args: any[]): MwnDate;
	getMonthName(monthNum: number): string;
	getMonthNameAbbrev(monthNum: number): string;
	getDayName(dayNum: number): string;
	getDayNameAbbrev(dayNum: number): string;
}

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
	add(number: number, unit: timeUnit): MwnDate;
	subtract(number: number, unit: timeUnit): MwnDate;
	format(formatstr: string, zone?: number | 'utc' | 'system'): string;
	calendar(zone?: number | 'utc' | 'system'): string;
}

/**
 * Wrapper around the native JS Date() for ease of
 * handling dates, as well as a constructor that
 * can parse MediaWiki dating formats.
 */

export default function (bot: mwn) {

	class XDate extends Date implements MwnDate {

		/**
		 * Create a date object. MediaWiki timestamp format is also acceptable,
		 * in addition to everything that JS Date() accepts.
		 */
		constructor(...args: any[]) {

			if (args.length === 1 && typeof args[0] === 'string') {
				// parse MediaWiki format: YYYYMMDDHHmmss
				if (/^\d{14}$/.test(args[0])) {
					let match = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(args[0]);
					let dateParts = match.slice(1).map(e => parseInt(e));
					super(dateParts[0], dateParts[1] - 1, // fix month
						dateParts[2], dateParts[3], dateParts[4], dateParts[5]);
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

		/**
		 * Add a given number of minutes, hours, days, months or years to the date.
		 * This is done in-place. The modified date object is also returned, allowing chaining.
		 * @param {number} number - should be an integer
		 * @param {string} unit
		 * @throws {Error} if invalid or unsupported unit is given
		 * @returns {XDate}
		 */
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

		/**
		 * Subtracts a given number of minutes, hours, days, months or years to the date.
		 * This is done in-place. The modified date object is also returned, allowing chaining.
		 * @param {number} number - should be an integer
		 * @param {string} unit
		 * @throws {Error} if invalid or unsupported unit is given
		 * @returns {XDate}
		 */
		subtract(number: number, unit: timeUnit): XDate {
			return this.add(-number, unit);
		}

		/**
		 * Formats the date into a string per the given format string.
		 * Replacement syntax is a subset of that in moment.js.
		 * @param {string} formatstr
		 * @param {(string|number)} [zone=utc] - 'system' (for system-default time zone),
		 * 'utc' (for UTC), or specify a time zone as number of minutes past UTC.
		 * @returns {string}
		 */
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

			const pad = function(num: number) {
				return String(num < 10 ? '0' + num : num);
			};
			const h24 = udate.getHours(), m = udate.getMinutes(), s = udate.getSeconds();
			const D = udate.getDate(), M = udate.getMonth() + 1, Y = udate.getFullYear();
			const h12 = h24 % 12 || 12, amOrPm = h24 >= 12 ? 'PM' : 'AM';
			const replacementMap = {
				'HH': pad(h24), 'H': h24, 'hh': pad(h12), 'h': h12, 'A': amOrPm,
				'mm': pad(m), 'm': m,
				'ss': pad(s), 's': s,
				'dddd': udate.getDayName(), 'ddd': udate.getDayNameAbbrev(), 'd': udate.getDay(),
				'DD': pad(D), 'D': D,
				'MMMM': udate.getMonthName(), 'MMM': udate.getMonthNameAbbrev(), 'MM': pad(M), 'M': M,
				'YYYY': Y, 'YY': pad(Y % 100), 'Y': Y
			};

			// as long as only unbind() and rebind() methods of bot.wikitext are used,
			// there shouldn't be problems from not having called getSiteInfo() on the bot object
			let unbinder = new bot.wikitext(formatstr); // escape stuff between [...]
			unbinder.unbind('\\[', '\\]');
			unbinder.text = unbinder.text.replace(
				/* Regex notes:
				 * d(d{2,3})? matches exactly 1, 3 or 4 occurrences of 'd' ('dd' is treated as a double match of 'd')
				 * Y{1,2}(Y{2})? matches exactly 1, 2 or 4 occurrences of 'Y'
				 */
				/H{1,2}|h{1,2}|m{1,2}|s{1,2}|d(d{2,3})?|D{1,2}|M{1,4}|Y{1,2}(Y{2})?|A/g,
				function(match) {
					// @ts-ignore
					return replacementMap[match];
				}
			);
			return unbinder.rebind().replace(/\[(.*?)\]/g, '$1');
		}

		/**
		 * Gives a readable relative time string such as "Yesterday at 6:43 PM" or "Last Thursday at 11:45 AM".
		 * Similar to calendar in moment.js, but with time zone support.
		 * @param {(string|number)} [zone=system] - 'system' (for browser-default time zone),
		 * 'utc' (for UTC), or specify a time zone as number of minutes past UTC
		 * @returns {string}
		 */
		calendar(zone: number | 'utc' | 'system' = 'utc'): string {
			// Zero out the hours, minutes, seconds and milliseconds - keeping only the date;
			// find the difference. Note that setHours() returns the same thing as getTime().
			const dateDiff = (new Date().setHours(0, 0, 0, 0) -
				new Date(this).setHours(0, 0, 0, 0)) / 8.64e7;
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

		static localeData = {
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			relativeTimes: {
				thisDay: '[Today at] h:mm A',
				prevDay: '[Yesterday at] h:mm A',
				nextDay: '[Tomorrow at] h:mm A',
				thisWeek: 'dddd [at] h:mm A',
				pastWeek: '[Last] dddd [at] h:mm A',
				other: 'YYYY-MM-DD'
			}
		}

		/**
		 * Get month name from month number (1-indexed)
		 */
		static getMonthName(monthNum: number): string {
			return XDate.localeData.months[monthNum - 1];
		}

		/**
		 * Get abbreviated month name from month number (1-indexed)
		 */
		static getMonthNameAbbrev(monthNum: number): string {
			return XDate.localeData.monthsShort[monthNum - 1];
		}

		/**
		 * Get day name from day number (1-indexed, starting from Sunday)
		 */
		static getDayName(dayNum: number): string {
			return XDate.localeData.days[dayNum - 1];
		}

		/**
		 * Get abbreviated day name from day number (1-indexed, starting from Sunday)
		 */
		static getDayNameAbbrev(dayNum: number): string {
			return XDate.localeData.daysShort[dayNum - 1];
		}

	}

	// Tweak set* methods (setHours, setUTCMinutes, etc) so that they
	// return the modified XDate object rather than the seconds-since-epoch
	// representation which is what JS Date() gives
	Object.getOwnPropertyNames(Date.prototype).filter(f => f.startsWith('set')).forEach(func => {
		let proxy = XDate.prototype[func];
		XDate.prototype[func] = function(...args) {
			proxy.call(this, ...args);
			return this;
		};
	});

	return XDate as MwnDateStatic;

}

// mapping time units with getter/setter function names for add and subtract
const unitMap = {
	seconds: 'Seconds',
	minutes: 'Minutes',
	hours: 'Hours',
	days: 'Date',
	months: 'Month',
	years: 'FullYear'
};

// plural or singular keys of unitMap
export type timeUnit  = keyof typeof unitMap | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year'

