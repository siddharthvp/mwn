/**
 * semlog
 * A semantic logger that colors and formats messages automatically according to the content
 *
 * Adapted from https://github.com/Fannon/semlog
 *
 * @author Simon Heimler
 * @author Siddharth VP - removed use of globals and adapted to TypeScript,
 * also removed some unnecessary features like in-memory log retention
 * and keeping track of statistics
 */

'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk');
const prettyjson = require('prettyjson');

export const logConfig = {
	printYaml: false,
	printDebug: true,
	printVerbose: true
};

export function updateLoggingConfig(options: typeof logConfig): void {
	Object.assign(logConfig, options);
}

/** Type of item logged */
type item = any;


/**
 * Custom Logging function
 *
 * Writes Logs to console, stringifies objects first
 *
 * @param obj
 */
export function log(obj: item): void {
	if (obj && obj instanceof Error) {
		error(obj);
	} else if (obj && typeof obj === 'object') {
		debug(obj);
	} else {
		message(obj);
	}
}

// Functions below are exported only for unit testing

export function message(msg: item) {

	if (typeof msg !== 'string') {
		try {
			msg = '' + JSON.stringify(msg);
		} catch (e) {
			msg = '[E] [Logger] Could not stringify given parameter';
		}
	}

	msg = colorize(msg);

	if (msg.trim && msg.trim().length > 0) {
		msg = chalk.gray('[' + humanDate() + '] ') + msg;
	}

	if (!logConfig.printVerbose && msg.indexOf('[V]') >= 0) {
		// Supressing output of verbose message
	} else if (!logConfig.printDebug && msg.indexOf('[D]') >= 0) {
		// Supressing output of debug message
	} else {
		console.log(msg);
	}

}

/**
 * Prints out debugging information for the current model object
 * @param obj
 */
export function debug(obj: item) {

	if (logConfig.printYaml) {
		// Print YAML
		let options = {
			keysColor: 'white',
			dashColor: 'white',
			stringColor: 'yellow',
			numberColor: 'blue'
		};

		console.log(chalk.gray('---\n') + prettyjson.render(obj, options));

	} else {
		// Print indented JSON
		let msg = JSON.stringify(obj, null, 4);
		console.log(chalk.gray(msg));
	}
}

/**
 * Prints errors
 * @param obj
 */
export function error(obj: Error) {
	console.error(chalk.red('[E] ' + obj.message));
	console.log(chalk.gray(JSON.stringify(obj, null, 4)));
	if (obj.stack) {
		console.log(chalk.gray(obj.stack));
	}
}

/**
 * Colors the messages by searching for specific indicator strings
 *
 * @param {string} msg
 * @returns {string}
 */
export function colorize(msg: item) {

	let colorMap = {
		'[E]': 'red',         // ERROR
		'[W]': 'yellow',      // WARNING
		'[?]': 'yellow',      // MISSING
		'[S]': 'green',       // SUCCESS
		'[i]': 'blue',        // INFO
		'[+]': 'green',       // ADDED
		'[-]': 'red',         // REMOVED
		'[C]': 'cyan',        // CHANGED
		'[U]': 'grey',        // UNCHANGED
		'[=]': 'grey',        // EQUAL
		'[/]': 'grey',        // SKIPPED
		'[V]': 'magenta',     // VERBOSE
		'[D]': 'magenta',     // DEBUG
		'[T]': 'magenta',     // TO-DO
		'[TODO]': 'magenta'   // TO-DO
	};

	for (let [code, color] of Object.entries(colorMap)) {
		if (msg && msg.indexOf && msg.startsWith(code)) {
			return chalk[color](msg);
		}
	}

	return msg;
}


/**
 * Pad a number with n digits
 *
 * @param {number} number   number to pad
 * @param {number} digits   number of total digits
 * @returns {string}
 */
export function pad(number: number, digits: number): string {
	return new Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
}

/**
 * Returns an array with date / time information
 * Starts with year at index 0 up to index 6 for milliseconds
 *
 * @param {Date} date   Optional date object. If falsy, will take current time.
 * @returns {Array}
 */
export function getDateArray(date: Date) {
	date = date || new Date();
	return [
		date.getFullYear(),
		pad(date.getMonth() + 1, 2),
		pad(date.getDate(), 2),
		pad(date.getHours(), 2),
		pad(date.getMinutes(), 2),
		pad(date.getSeconds(), 2),
		pad(date.getMilliseconds(), 2)
	];
}

/**
 * Returns nicely formatted date-time
 * @example 2015-02-10 16:01:12
 *
 * @param {object} [date]
 * @returns {string}
 */
export function humanDate(date?: Date): string {
	date = date || new Date();
	let d = getDateArray(date);
	return d[0] + '-' + d[1] + '-' + d[2] + ' ' + d[3] + ':' + d[4] + ':' + d[5];
}
