"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MwnError = void 0;
class MwnError extends Error {
    /**
     * @param {Object} config
     */
    constructor(config) {
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
}
exports.MwnError = MwnError;
MwnError.MissingPage = class MwnErrorMissingPage extends MwnError {
    constructor(config = {}) {
        super({
            code: 'missingtitle',
            info: 'The page you specified doesn\'t exist.',
            ...config
        });
    }
};
