import type { RawRequestParams } from './core';

// make this extend AxiosError?
export type MwnErrorConfig = {
	code: string;
	info?: string;
	html?: string; // errorformat html
	text?: string; // errorformat plaintext/wikitext
	response?: Record<string, unknown>;
	request?: RawRequestParams;
	disableRetry?: boolean;
};

export class MwnError extends Error {
	// The error object can have arbitrary properties
	[key: string]: any;
	code?: string;
	info?: string;

	/**
	 * @param {Object} config
	 */
	constructor(config: Error | MwnErrorConfig) {
		if (config instanceof Error) {
			return config;
		}
		// If it's an mwn internal error, don't put the error code (begins with "mwn")
		// in the error message
		const code = !config.code || config.code.startsWith('mwn') ? '' : config.code + ': ';
		const info = config.info || config.text || config.html || '';
		super(code + info);

		Object.assign(this, config);
		this.info = info; // not already present in case of html/wikitext/plaintext error formats
	}
}

export class MwnMissingPageError extends MwnError {
	constructor(config: Partial<MwnErrorConfig> = {}) {
		super({
			code: 'missingtitle',
			info: "The page you specified doesn't exist.",
			...config,
		});
	}
}

/**
 * Returns a promise rejected with an error object
 * @private
 * @param {string} errorCode
 * @returns {Promise}
 */
export function rejectWithErrorCode(errorCode: string): Promise<never> {
	return rejectWithError({
		code: errorCode,
	});
}

export function rejectWithError(errorConfig: MwnErrorConfig | Error): Promise<never> {
	return Promise.reject(new MwnError(errorConfig));
}
