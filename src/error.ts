export type MwnErrorConfig = {
	code: string,
	info?: string,
	response?: Object,
	request?: Object,
	disableRetry?: boolean
}

export class MwnError extends Error {
	/**
	 * @param {Object} config
	 */
	constructor(config: any) {
		// If it's an mwn internal error, don't put the error code (begins with "mwn")
		// in the error message
		const code = (!config.code || config.code.startsWith('mwn')) ? '' : config.code + ': ';
		const info = config.info || '';
		super(code + info);
		Object.assign(this, config);
	}

	static MissingPage = class MwnErrorMissingPage extends MwnError {
		constructor(config: any) {
			super({
				code: 'missingarticle',
				info: 'Page does not exist',
				...config
			});
		}
	}
}

