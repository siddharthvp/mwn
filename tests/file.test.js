'use strict';

const { bot, assert, expect, setup, teardown} = require('./test_wiki');

describe('File', async function() {

	before('logs in and gets token & namespaceInfo', setup);
	after('logs out', teardown);


	it('file constructor', function() {
		let file = new bot.file('file:Xyz');
		expect(file.title === 'Xyz' && file.namespace === 6).to.be.ok;
		let badFileConstruction = function() {
			new bot.file('Template:Abc');
		};
		expect(badFileConstruction).to.throw('not a file');
		let fileWithoutNs = new bot.file('Fridawulfa');
		expect(fileWithoutNs.namespace).to.equal(6);
	});

	it('getName and getNameText', function() {
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

	// TODO: usages

});
