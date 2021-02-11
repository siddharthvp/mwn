'use strict';

const {log, error, getDateArray, humanDate, pad, updateLoggingConfig} = require('../build/log');
const expect = require('chai').expect;

describe('logger', function() {

	it('logs a string message to the console', function() {

		console.log('');
		console.log('-------------------------------------------------------------');
		console.log(' Testing Log Messages');
		console.log('-------------------------------------------------------------');

		log('[i] info log entry ');
		log('[W] warning log entry');
		log('[E] error log entry');
		log('[S] success log entry');
		log('[D] debug log entry');
		log('[+] added log entry');
		log('[-] removed log entry');
		log('[C] changed log entry');
		log('[TODO] todo log entry');
		log('unknown todo log entry');

		// console.dir(semlog.getLogHistory());

		console.log('');
		console.log('-------------------------------------------------------------');
		console.log(' Testing Numbers and Datatypes');
		console.log('-------------------------------------------------------------');

		log(3);
		log([1, 2, 3]);
		log(true);
		log(false);
		log(null);
		log(Infinity);


		console.log('');
		console.log('-------------------------------------------------------------');
		console.log(' Testing Log Objects and Errors');
		console.log('-------------------------------------------------------------');

		// Create a new object, that prototypally inherits from the Error constructor.
		function MyError(message) {
			this.name = 'MyError';
			this.message = message || 'Default Message';
		}
		MyError.prototype = Object.create(Error.prototype);
		MyError.prototype.constructor = MyError;

		log({title: 'Object log entry', number: 10});
		log(new Error('error log entry'));
		log(new TypeError('error log entry'));
		log(new MyError('error log entry'));

		console.log('-------------------------------------------------------------');
		console.log('');
	});

	it('prints objects as colorized YAML', function() {
		updateLoggingConfig({printYaml: true});
		log({
			text: 'text',
			number: 42,
			array: [1, '2'],
			object: {
				key: 'value'
			}
		});
		updateLoggingConfig({printYaml: false});
	});

	it('prints errors', function() {
		error(new Error('Test Error'));
	});

	it('handles various invalid log objects', function() {
		log(undefined);
		log(null);
		log(Error);
		log(Infinity);
	});

});

describe('semlog utilities', function() {

	it('pad numbers', function() {
		expect(pad(7, 1)).to.equal('7');
		expect(pad(7, 2)).to.equal('07');
		expect(pad(7, 3)).to.equal('007');
	});

	it('creates date arrays', function() {
		expect(getDateArray().length).to.equal(7);
		expect(getDateArray()[0]).to.equal(new Date().getFullYear());
	});

	it('return human readable date-times', function() {
		expect(humanDate().length).to.equal(19);
		expect(humanDate(new Date('October 13, 2014 11:13:00'))).to.equal('2014-10-13 11:13:00');
	});


});
