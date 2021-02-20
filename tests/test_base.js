/** Base libraries used in tests */

const {mwn} = require('..');
const log = mwn.log;
const crypto = require('crypto');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
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

module.exports = {mwn, log, crypto, expect, assert, sinon, verifyTokenAndSiteInfo};
