/**
 * Private utilities
 */
import type { MwnTitle } from "./bot";
/** Check whether object looks like a promises-A+ promise, from https://www.npmjs.com/package/is-promise */
export declare function ispromise(obj: any): boolean;
/** Check whether an object is plain object, from https://github.com/sindresorhus/is-plain-obj/blob/master/index.js */
export declare function isplainobject(value: any): boolean;
/**
 * Simple wrapper around Object.assign to merge objects. null and undefined
 * arguments in argument list will be ignored.
 *
 * @param {...Object} objects - if the same property exists on multiple
 * objects, the value on the rightmost one will be kept in the output.
 * @returns {Object} - Merged object
 */
export declare function merge(...objects: any[]): any;
/**
 * Merge objects deeply to 1 level. Object properties like params, data,
 * headers get merged. But not any object properties within them.
 * Arrays are not merged, but over-written (as if it were a primitive)
 * The first object is mutated and returned.
 * @param {...Object} objects - any number of objects
 * @returns {Object}
 */
export declare function mergeDeep1(...objects: any[]): any;
/**
 * @param {Array} arr
 * @param {number} size
 */
export declare function arrayChunk<T>(arr: T[], size: number): T[][];
export declare function sleep(duration: number): Promise<void>;
export declare function makeTitles(pages: string | string[] | number | number[] | MwnTitle | MwnTitle[]): {
    titles: string[];
} | {
    pageids: number[];
};
export declare function makeTitle(page: string | number | MwnTitle): {
    title: string;
} | {
    pageid: number;
};
