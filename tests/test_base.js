/** Base libraries used in tests */

const { mwn } = require('..');
const log = mwn.log;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

// Get CI working on node v10:
// Yargs dependency of mocha-chai-jest-snapshot isn't supported on Node.js v10 and
// throws an error when used, this hack prevents that, but only because of
// https://github.com/yargs/yargs/blob/HEAD/lib/cjs.ts#L16
process.env.YARGS_MIN_NODE_VERSION = '10';

const { jestSnapshotPlugin } = require("mocha-chai-jest-snapshot");
chai.use(jestSnapshotPlugin());

const expect = chai.expect;
const assert = require('assert');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

function verifyTokenAndSiteInfo(bot) {
	expect(bot.csrfToken).to.be.a('string').of.length.greaterThan(5);
	expect(bot.csrfToken.endsWith('+\\')).to.be.true;
	expect(bot.title.nameIdMap).to.be.a('object');
	expect(bot.title.legaltitlechars).to.be.a('string');
	expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
}

module.exports = { mwn, log, expect, assert, sinon, verifyTokenAndSiteInfo };
