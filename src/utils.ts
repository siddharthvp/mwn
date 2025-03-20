/**
 * Private utilities
 */

import type { MwnTitle } from './title';

/** Check whether object looks like a promises-A+ promise, from https://www.npmjs.com/package/is-promise */
export function ispromise(obj: any): boolean {
	return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

/** Check whether an object is plain object, from https://github.com/sindresorhus/is-plain-obj/blob/master/index.js */
export function isplainobject(value: any): boolean {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}

/**
 * Simple wrapper around Object.assign to merge objects. null and undefined
 * arguments in argument list will be ignored.
 *
 * @param {...Object} objects - if the same property exists on multiple
 * objects, the value on the rightmost one will be kept in the output.
 * @returns {Object} - Merged object
 */
export function merge(...objects: any[]) {
	// {} used as first parameter as this object is mutated by default
	return Object.assign({}, ...objects);
}

/**
 * Merge objects deeply to 1 level. Object properties like params, data,
 * headers get merged. But not any object properties within them.
 * Arrays are not merged, but over-written (as if it were a primitive)
 * The first object is mutated and returned.
 * @param {...Object} objects - any number of objects
 * @returns {Object}
 */
export function mergeDeep1(...objects: any[]) {
	let args = [...objects].filter((e) => e); // skip null/undefined values
	for (let options of args.slice(1)) {
		for (let [key, val] of Object.entries(options)) {
			if (isplainobject(val)) {
				args[0][key] = merge(args[0][key], val);
				// this can't be written as Object.assign(args[0][key], val)
				// as args[0][key] could be undefined
			} else {
				args[0][key] = val;
			}
		}
	}
	return args[0];
}

/**
 * @param {Array} arr
 * @param {number} size
 */
export function arrayChunk<T>(arr: T[], size: number): T[][] {
	const numChunks = Math.ceil(arr.length / size);
	let result = new Array(numChunks);
	for (let i = 0; i < numChunks; i++) {
		result[i] = arr.slice(i * size, (i + 1) * size);
	}
	return result;
}

export function sleep(duration: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

export function makeTitles(
	pages: string | string[] | number | number[] | MwnTitle | MwnTitle[]
): { titles: string[] } | { pageids: number[] } {
	let pagesArray = Array.isArray(pages) ? pages : [pages];
	if (typeof pagesArray[0] === 'number') {
		return { pageids: pagesArray as number[] };
	} else {
		// .join casts array elements to strings and then joins
		return { titles: pagesArray as string[] };
	}
}

export function makeTitle(page: string | number | MwnTitle): { title: string } | { pageid: number } {
	if (typeof page === 'number') {
		return { pageid: page };
	} else {
		return { title: String(page) };
	}
}
