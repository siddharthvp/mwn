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
export declare const logConfig: {
    printYaml: boolean;
    printDebug: boolean;
    printVerbose: boolean;
};
export declare function updateLoggingConfig(options: typeof logConfig): void;
/** Type of item logged */
declare type item = any;
/**
 * Custom Logging function
 *
 * Writes Logs to console, stringifies objects first
 *
 * @param obj
 */
export declare function log(obj: item): void;
export declare function message(msg: item): void;
/**
 * Prints out debugging information for the current model object
 * @param obj
 */
export declare function debug(obj: item): void;
/**
 * Prints errors
 * @param obj
 */
export declare function error(obj: Error): void;
/**
 * Colors the messages by searching for specific indicator strings
 *
 * @param {string} msg
 * @returns {string}
 */
export declare function colorize(msg: item): any;
/**
 * Pad a number with n digits
 *
 * @param {number} number   number to pad
 * @param {number} digits   number of total digits
 * @returns {string}
 */
export declare function pad(number: number, digits: number): string;
/**
 * Returns an array with date / time information
 * Starts with year at index 0 up to index 6 for milliseconds
 *
 * @param {Date} date   Optional date object. If falsy, will take current time.
 * @returns {Array}
 */
export declare function getDateArray(date: Date): (string | number)[];
/**
 * Returns nicely formatted date-time
 * @example 2015-02-10 16:01:12
 *
 * @param {object} [date]
 * @returns {string}
 */
export declare function humanDate(date?: Date): string;
export {};
