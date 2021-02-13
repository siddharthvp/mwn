/** Base libraries used in tests */

const {mwn} = require('../build/bot');
const log = mwn.log;
const crypto = require('crypto');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = require('assert');
const sinon = require('sinon');

module.exports = {mwn, log, crypto, expect, assert, sinon};
