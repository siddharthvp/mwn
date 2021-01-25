"use strict";
/**
 * Private utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTitle = exports.makeTitles = exports.sleep = exports.arrayChunk = exports.mergeDeep1 = exports.merge = exports.isplainobject = exports.ispromise = void 0;
/** Check whether object looks like a promises-A+ promise, from https://www.npmjs.com/package/is-promise */
function ispromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') &&
        typeof obj.then === 'function';
}
exports.ispromise = ispromise;
/** Check whether an object is plain object, from https://github.com/sindresorhus/is-plain-obj/blob/master/index.js */
function isplainobject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
}
exports.isplainobject = isplainobject;
/**
 * Simple wrapper around Object.assign to merge objects. null and undefined
 * arguments in argument list will be ignored.
 *
 * @param {...Object} objects - if the same property exists on multiple
 * objects, the value on the rightmost one will be kept in the output.
 * @returns {Object} - Merged object
 */
function merge(...objects) {
    // {} used as first parameter as this object is mutated by default
    return Object.assign({}, ...objects);
}
exports.merge = merge;
/**
 * Merge objects deeply to 1 level. Object properties like params, data,
 * headers get merged. But not any object properties within them.
 * Arrays are not merged, but over-written (as if it were a primitive)
 * The first object is mutated and returned.
 * @param {...Object} objects - any number of objects
 * @returns {Object}
 */
function mergeDeep1(...objects) {
    let args = [...objects].filter(e => e); // skip null/undefined values
    for (let options of args.slice(1)) {
        for (let [key, val] of Object.entries(options)) {
            if (isplainobject(val)) {
                args[0][key] = merge(args[0][key], val);
                // this can't be written as Object.assign(args[0][key], val)
                // as args[0][key] could be undefined
            }
            else {
                args[0][key] = val;
            }
        }
    }
    return args[0];
}
exports.mergeDeep1 = mergeDeep1;
/**
 * @param {Array} arr
 * @param {number} size
 */
function arrayChunk(arr, size) {
    const numChunks = Math.ceil(arr.length / size);
    let result = new Array(numChunks);
    for (let i = 0; i < numChunks; i++) {
        result[i] = arr.slice(i * size, (i + 1) * size);
    }
    return result;
}
exports.arrayChunk = arrayChunk;
function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}
exports.sleep = sleep;
function makeTitles(pages) {
    let pagesArray = Array.isArray(pages) ? pages : [pages];
    if (typeof pagesArray[0] === 'number') {
        return { pageids: pagesArray };
    }
    else {
        // .join casts array elements to strings and then joins
        return { titles: pagesArray };
    }
}
exports.makeTitles = makeTitles;
function makeTitle(page) {
    if (typeof page === 'number') {
        return { pageid: page };
    }
    else {
        return { title: String(page) };
    }
}
exports.makeTitle = makeTitle;
