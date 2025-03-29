'use strict';

// TODO: use sinon to disable visible logging and check chalk function calls

const { log, error, getDateArray, humanDate, pad, updateLoggingConfig } = require('../build/log');
const { readFile, rm } = require('fs/promises');
const { createWriteStream } = require('fs');
const expect = require('chai').expect;

describe('logger', function () {
	it('logs a string message to the console', function () {
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

		log({ title: 'Object log entry', number: 10 });
		log(new Error('error log entry'));
		log(new TypeError('error log entry'));
		log(new MyError('error log entry'));

		console.log('-------------------------------------------------------------');
		console.log('');
	});

	it('logs messages to files', async function () {
		const logPath = __dirname + '/log.txt';

		const fileStream = createWriteStream(logPath, { flags: 'a', encoding: 'utf-8' });
		updateLoggingConfig({
			stream: fileStream,
		});

		log('[i] Hello World');

		// Reset
		updateLoggingConfig({
			stream: process.stdout,
		});

		return new Promise((resolve, reject) => {
			// Wait for file contents to be flushed
			process.nextTick(async function () {
				try {
					const logContent = await readFile(logPath, { encoding: 'utf-8' });
					expect(logContent).to.contain('Hello World');
					await rm(logPath);
					resolve();
				} catch (err) {
					reject(err);
				}
			});
		});
	});

	it('prints errors', function () {
		error(new Error('Test Error'));
	});

	it('handles various invalid log objects', function () {
		log(undefined);
		log(null);
		log(Error);
		log(Infinity);
	});
});

describe('semlog utilities', function () {
	it('pads numbers', function () {
		expect(pad(7, 1)).to.equal('7');
		expect(pad(7, 2)).to.equal('07');
		expect(pad(7, 3)).to.equal('007');
	});

	it('creates date arrays', function () {
		expect(getDateArray().length).to.equal(7);
		expect(getDateArray()[0]).to.equal(new Date().getFullYear());
	});

	it('returns human readable date-times', function () {
		expect(humanDate().length).to.equal(19);
		expect(humanDate(new Date('October 13, 2014 11:13:00'))).to.equal('2014-10-13 11:13:00');
	});
});
