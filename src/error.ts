import type {RawRequestParams} from "./bot";

export type MwnErrorConfig = {
	code: string,
	info?: string,
	response?: Record<string, unknown>,
	request?: RawRequestParams,
	disableRetry?: boolean
}

export class MwnError extends Error {
	/**
	 * @param {Object} config
	 */
	constructor(config: Error | MwnErrorConfig) {
		if (config instanceof Error) {
			return config;
		}
		// If it's an mwn internal error, don't put the error code (begins with "mwn")
		// in the error message
		const code = (!config.code || config.code.startsWith('mwn')) ? '' : config.code + ': ';
		const info = config.info || '';
		super(code + info);
		Object.assign(this, config);
	}

	static MissingPage = class MwnErrorMissingPage extends MwnError {
		constructor(config: Partial<MwnErrorConfig> = {}) {
			super({
				code: 'missingtitle',
				info: 'The page you specified doesn\'t exist.',
				...config
			});
		}
	}
}

