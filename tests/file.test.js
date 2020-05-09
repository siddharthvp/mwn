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

describe('File', async function() {

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


	it('file constructor', function() {
		var file = new bot.file('file:Xyz');
		expect(file.title === 'Xyz' && file.namespace === 6).to.be.ok;
		var badFileConstruction = function() {
			new bot.file('Template:Abc');
		};
		expect(badFileConstruction).to.throw('not a file');
		var fileWithoutNs = new bot.file('Fridawulfa');
		expect(fileWithoutNs.namespace).to.equal(6);
	});

	it('getName', function() {
		var file = new bot.file( 'File:Foo_bar.JPG' );
		assert.strictEqual( file.getName(), 'Foo_bar' );
		assert.strictEqual( file.getNameText(), 'Foo bar' );

		file = new bot.file( '.foo' );
		assert.strictEqual( file.getName(), '' );
		assert.strictEqual( file.getNameText(), '' );

		file = new bot.file( 'File:quux pif.jpg' );
		assert.strictEqual( file.getNameText(), 'Quux pif', 'First character of title' );

		file = new bot.file( 'File:Glarg_foo_glang.jpg' );
		assert.strictEqual( file.getNameText(), 'Glarg foo glang', 'Underscores' );
	});

});