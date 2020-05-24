'use strict';

const mwn = require('../src/bot');
const expect = require('chai').expect;
const assert = require('assert');

const loginCredentials = require('./mocking/loginCredentials.js').valid;

let bot = new mwn({
	silent: true,
	hasApiHighLimit: true,
	apiUrl: loginCredentials.apiUrl,
	username: loginCredentials.username,
	password: loginCredentials.password
});

describe('static utils', function() {

	before('logs in and gets token & namespaceInfo', function(done) {
		this.timeout(7000);
		bot.loginGetToken().then(() => {
			expect(bot.csrfToken).to.be.a('string');
			assert(bot.csrfToken.endsWith('+\\'));
			expect(bot.title.nameIdMap).to.be.a('object');
			expect(bot.title.legaltitlechars).to.be.a('string');
			expect(bot.title.nameIdMap).to.include.all.keys('project', 'user');
			done();
		});
	});

	after('logs out', function(done) {
		this.timeout(4000);
		bot.logout().then(() => done());
	});

	it('link', function() {
		expect(mwn.link('Main Page')).to.equal('[[Main Page]]');
		expect(mwn.link('Main Page', 'homepage')).to.equal('[[Main Page|homepage]]');
	
		var title = new bot.title('main Page');
		expect(mwn.link(title)).to.equal('[[Main Page]]');
		expect(mwn.link(title, 'homepage')).to.equal('[[Main Page|homepage]]');
	
		var titleWithFragment = new bot.title('Main Page#Did You Know');
		expect(mwn.link(titleWithFragment)).to.equal('[[Main Page#Did You Know]]');
		expect(mwn.link(titleWithFragment, 'homepage')).to.equal('[[Main Page#Did You Know|homepage]]');
	});
	
	
	it('template', function() {
		expect(mwn.template('cite', {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');
	
		expect(mwn.template(new bot.title('template:cite#fragment'), {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');
	
		// mainspace template
		expect(mwn.template(new bot.title('cite#fragment'), {
			author: 'John Doe',
			date: '14 January 2012',
			url: 'https://example.com',
			1: 'web'
		})).to.equal('{{:Cite|1=web|author=John Doe|date=14 January 2012|url=https://example.com}}');
	});


	it('table', function() {
		var expected1 = `{| class="wikitable"
|-
! Header text !! Header text !! Header text
|-
| Example || Example || Example
|-
| Example || Example || Example
|}`;

		var table = new mwn.table();
		table.addHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', 'Example', 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.getText()).to.equal(expected1);

		var expected2 = `{| class="wikitable sortable"
|-
! Header1 text !! Header2 text !! Header3 text
|-
| Example11 || Example12 || Example13
|-
| Example21 || Example22 || Example23
|}`;

		table = new mwn.table({ sortable: true });
		table.addHeaders(['Header1 text', 'Header2 text', 'Header3 text']);
		table.addRow(['Example11', 'Example12', 'Example13']);
		table.addRow(['Example21', 'Example22', 'Example23']);
		expect(table.getText()).to.equal(expected2);

		expect(new mwn.table({ sortable: true }).getText()).to.equal(`{| class="wikitable sortable"\n|}`);
		expect(new mwn.table({ plain: true }).getText()).to.equal(`{| \n|}`);

	});
		
});
