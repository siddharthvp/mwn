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

import * as util from 'node:util';
import * as stream from 'node:stream';
/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk');

export interface LogConfig {
	/** Whether debug level log (starting with [D]) should be printed */
	printDebug?: boolean;
	/** Whether verbose logs (starting with [D]) should be printed */
	printVerbose?: boolean;
	/**
	 * The writable stream for logs. Defaults to stdout. To log to a file, use
	 * ```js
	 * fs.createWriteStream(__dirname + '/mwn.log', {
	 *     flags: 'a',
	 *     encoding: 'utf8'
	 * })
	 * ```
	 */
	stream?: stream.Writable;
}

const logConfig: LogConfig = {
	printDebug: true,
	printVerbose: true,
	stream: process.stdout as stream.Writable,
};

/**
 * Configure global logging options.
 *
 * Note: To suppress API warnings, use `suppressAPIWarnings` flag in bot instance options instead.
 */
export function updateLoggingConfig(options: LogConfig): void {
	Object.assign(logConfig, options);
}

/** Type of item logged */
type item = any;

/**
 * Custom Logging function
 *
 * Writes logs to console or file, stringifies objects first
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
			msg = `[E] [Logger] Could not stringify given parameter: ${e.message}`;
		}
	}

	msg = colorize(msg);

	if (msg.trim && msg.trim().length > 0) {
		msg = colorize('[' + humanDate() + '] ', 'gray') + msg;
	}

	if (!logConfig.printVerbose && msg.indexOf('[V]') >= 0) {
		// Supressing output of verbose message
	} else if (!logConfig.printDebug && msg.indexOf('[D]') >= 0) {
		// Supressing output of debug message
	} else {
		writeToLog(msg);
	}
}

/**
 * Prints out debugging information for the current model object
 * @param obj
 */
export function debug(obj: item) {
	// Print indented JSON
	let msg = JSON.stringify(obj, null, 4);
	writeToLog(colorize(msg, 'gray'));
}

/**
 * Prints errors
 * @param obj
 */
export function error(obj: Error) {
	writeToLog(colorize('[E] ' + obj.message, 'red'));
	let stringified;
	try {
		stringified = JSON.stringify(obj, null, 4);
	} catch (e) {
		// Circular object?
		stringified = `Failed to stringify error: ${e.message}`;
	}
	writeToLog(colorize(stringified, 'gray'));
	if (obj.stack) {
		writeToLog(colorize(obj.stack, 'gray'));
	}
}

let colorMap = {
	'[E]': 'red', // ERROR
	'[W]': 'yellow', // WARNING
	'[?]': 'yellow', // MISSING
	'[S]': 'green', // SUCCESS
	'[i]': 'blue', // INFO
	'[+]': 'green', // ADDED
	'[-]': 'red', // REMOVED
	'[C]': 'cyan', // CHANGED
	'[U]': 'grey', // UNCHANGED
	'[=]': 'grey', // EQUAL
	'[/]': 'grey', // SKIPPED
	'[V]': 'magenta', // VERBOSE
	'[D]': 'magenta', // DEBUG
	'[T]': 'magenta', // TO-DO
	'[TODO]': 'magenta', // TO-DO
};

/**
 * Colors the messages by searching for specific indicator strings
 *
 * @param {string} msg
 * @param {string} colorName
 * @returns {string}
 */
export function colorize(msg: item, colorName?: string) {
	if (logConfig.stream !== process.stdout) {
		return msg;
	}
	if (colorName) {
		return chalk[colorName](msg);
	}
	for (let [code, color] of Object.entries(colorMap)) {
		if (msg && msg.indexOf && msg.startsWith(code)) {
			return chalk[color](msg);
		}
	}

	return msg;
}

function writeToLog(message: string) {
	if (logConfig.stream === process.stdout) {
		console.log(message);
	} else {
		logConfig.stream.write(util.format.apply(null, [message]) + '\n');
	}
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
		pad(date.getMilliseconds(), 2),
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
