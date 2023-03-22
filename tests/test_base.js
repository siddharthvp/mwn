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

const { jestSnapshotPlugin } = require('mocha-chai-jest-snapshot');
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

/** Populate title data without an API request **/
function populateTitleData(titleObj) {
	Object.assign(titleObj, {
		idNameMap: {
			'-2': 'Media',
			'-1': 'Special',
			'0': '',
			'1': 'Talk',
			'2': 'User',
			'3': 'User talk',
			'4': 'Wikipedia',
			'5': 'Wikipedia talk',
			'6': 'File',
			'7': 'File talk',
			'8': 'MediaWiki',
			'9': 'MediaWiki talk',
			'10': 'Template',
			'11': 'Template talk',
			'12': 'Help',
			'13': 'Help talk',
			'14': 'Category',
			'15': 'Category talk',
			// testing custom / localized namespace
			'100': 'Penguins',
		},

		nameIdMap: {
			'media': -2,
			'special': -1,
			'': 0,
			'talk': 1,
			'user': 2,
			'user_talk': 3,
			'wikipedia': 4,
			'wikipedia_talk': 5,
			'file': 6,
			'file_talk': 7,
			'mediawiki': 8,
			'mediawiki_talk': 9,
			'template': 10,
			'template_talk': 11,
			'help': 12,
			'help_talk': 13,
			'category': 14,
			'category_talk': 15,
			'image': 6,
			'image_talk': 7,
			'project': 4,
			'project_talk': 5,
			// Testing custom namespaces and aliases
			'penguins': 100,
			'antarctic_waterfowl': 100,
		},

		caseSensitiveNamespaces: [],

		legaltitlechars: ' %!"$&\'()*,\\-./0-9:;=?@A-Z\\\\\\^_`a-z~+\\u0080-\\uFFFF',
	});
}

module.exports = { mwn, log, expect, assert, sinon, verifyTokenAndSiteInfo, populateTitleData };
