module.exports = function(bot) {

	/**
	 * Wrapper around the native JS Date() for ease of
	 * handling dates, as well as a constructor that
	 * can parse MediaWiki dating formats.
	 */
	class xdate extends Date {

		/**
		 * Create a date object. MediaWiki timestamp format is also acceptable,
		 * in addition to everything that JS Date() accepts.
		 */
		constructor(...args) {

			if (args.length === 1 && typeof args[0] === 'string') {
				// parse MediaWiki format: YYYYMMDDHHmmss
				if (/^\d{14}$/.test(args[0])) {
					let match = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(args[0]);
					match[2] = parseInt(match[2]) - 1; // fix month
					super(...match.slice(1));
				} else {
					// Attempt to remove a comma and paren-wrapped timezone, to get MediaWiki
					// signature timestamps to parse. Firefox (at least in 75) seems to be
					// okay with the comma, though
					args[0] = args[0].replace(/(\d\d:\d\d),/, '$1').replace(/\(UTC\)/, 'UTC');
					super(...args);
				}
			} else {
				super(...args);
			}

			// Still no?
			if (isNaN(this.getTime()) && !bot.options.suppressInvalidDateWarning) {
				console.warn('Invalid initialisation of xdate object: ', args);
			}
		}

		/** @return {boolean} */
		isValid() {
			return !isNaN(this.getTime());
		}

		/**
		 * @param {(Date|xdate)} date
		 * @return {boolean}
		 */
		isBefore(date) {
			return this.getTime() < date.getTime();
		}

		/**
		 * @param {(Date|xdate)} date
		 * @return {boolean}
		 */
		isAfter(date) {
			return this.getTime() > date.getTime();
		}

		/** @return {string} */
		getUTCMonthName() {
			return xdate.localeData.months[this.getUTCMonth()];
		}

		/** @return {string} */
		getUTCMonthNameAbbrev() {
			return xdate.localeData.monthsShort[this.getUTCMonth()];
		}

		/** @return {string} */
		getMonthName() {
			return xdate.localeData.months[this.getMonth()];
		}

		/** @return {string} */
		getMonthNameAbbrev() {
			return xdate.localeData.monthsShort[this.getMonth()];
		}

		/** @return {string} */
		getUTCDayName() {
			return xdate.localeData.days[this.getUTCDay()];
		}

		/** @return {string} */
		getUTCDayNameAbbrev() {
			return xdate.localeData.daysShort[this.getUTCDay()];
		}

		/** @return {string} */
		getDayName() {
			return xdate.localeData.days[this.getDay()];
		}

		/** @return {string} */
		getDayNameAbbrev() {
			return xdate.localeData.daysShort[this.getDay()];
		}

		/**
		 * Add a given number of minutes, hours, days, months or years to the date.
		 * This is done in-place. The modified date object is also returned, allowing chaining.
		 * @param {number} number - should be an integer
		 * @param {string} unit
		 * @throws {Error} if invalid or unsupported unit is given
		 * @returns {xdate}
		 */
		add(number, unit) {
			// mapping time units with getter/setter function names
			var unitMap = {
				seconds: 'Seconds',
				minutes: 'Minutes',
				hours: 'Hours',
				days: 'Date',
				months: 'Month',
				years: 'FullYear'
			};
			var unitNorm = unitMap[unit] || unitMap[unit + 's']; // so that both singular and  plural forms work
			if (unitNorm) {
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
		 * @returns {xdate}
		 */
		subtract(number, unit) {
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
		format(formatstr, zone) {
			if (!this.isValid()) {
				return ''; // avoid bogus NaNs in output
			}
			var udate = this;
			// create a new date object that will contain the date to display as system time
			if (!zone || zone === 'utc') {
				udate = new xdate(this.getTime()).add(this.getTimezoneOffset(), 'minutes');
			} else if (typeof zone === 'number') {
				// convert to utc, then add the utc offset given
				udate = new xdate(this.getTime()).add(this.getTimezoneOffset() + zone, 'minutes');
			}

			var pad = function(num) {
				return num < 10 ? '0' + num : num;
			};
			var h24 = udate.getHours(), m = udate.getMinutes(), s = udate.getSeconds();
			var D = udate.getDate(), M = udate.getMonth() + 1, Y = udate.getFullYear();
			var h12 = h24 % 12 || 12, amOrPm = h24 >= 12 ? 'PM' : 'AM';
			var replacementMap = {
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
			var unbinder = new bot.wikitext(formatstr); // escape stuff between [...]
			unbinder.unbind('\\[', '\\]');
			unbinder.text = unbinder.text.replace(
				/* Regex notes:
				 * d(d{2,3})? matches exactly 1, 3 or 4 occurrences of 'd' ('dd' is treated as a double match of 'd')
				 * Y{1,2}(Y{2})? matches exactly 1, 2 or 4 occurrences of 'Y'
				 */
				/H{1,2}|h{1,2}|m{1,2}|s{1,2}|d(d{2,3})?|D{1,2}|M{1,4}|Y{1,2}(Y{2})?|A/g,
				function(match) {
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
		calendar(zone) {
			// Zero out the hours, minutes, seconds and milliseconds - keeping only the date;
			// find the difference. Note that setHours() returns the same thing as getTime().
			var dateDiff = (new Date().setHours(0, 0, 0, 0) -
				new Date(this).setHours(0, 0, 0, 0)) / 8.64e7;
			switch (true) {
				case dateDiff === 0:
					return this.format(xdate.localeData.relativeTimes.thisDay, zone);
				case dateDiff === 1:
					return this.format(xdate.localeData.relativeTimes.prevDay, zone);
				case dateDiff > 0 && dateDiff < 7:
					return this.format(xdate.localeData.relativeTimes.pastWeek, zone);
				case dateDiff === -1:
					return this.format(xdate.localeData.relativeTimes.nextDay, zone);
				case dateDiff < 0 && dateDiff > -7:
					return this.format(xdate.localeData.relativeTimes.thisWeek, zone);
				default:
					return this.format(xdate.localeData.relativeTimes.other, zone);
			}
		}

	}

	xdate.localeData = {
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
	};

	// TODO: allow easier i18n
	xdate.loadLocaleData = function(data) {
		xdate.localeData = data;
	};

	/**
	 * Get month name from month number (1-indexed)
	 * @param {number} monthNum
	 * @returns {string}
	 */
	xdate.getMonthName = function(monthNum) {
		return xdate.localeData.months[monthNum - 1];
	};

	/**
	 * Get abbreviated month name from month number (1-indexed)
	 * @param {number} monthNum
	 * @returns {string}
	 */
	xdate.getMonthNameAbbrev = function(monthNum) {
		return xdate.localeData.monthsShort[monthNum - 1];
	};

	/**
	 * Get day name from day number (1-indexed, starting from Sunday)
	 * @param {number} dayNum
	 * @returns {string}
	 */
	xdate.getDayName = function(dayNum) {
		return xdate.localeData.days[dayNum - 1];
	};

	/**
	 * Get abbreviated day name from day number (1-indexed, starting from Sunday)
	 * @param {number} dayNum
	 * @returns {string}
	 */
	xdate.getDayNameAbbrev = function(dayNum) {
		return xdate.localeData.daysShort[dayNum - 1];
	};

	return xdate;

};
