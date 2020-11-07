/// <reference types="node" />
export declare type MwnErrorConfig = {
    code: string;
    info?: string;
    response?: Object;
    request?: Object;
    disableRetry?: boolean;
};
export declare class MwnError extends Error {
    /**
     * @param {Object} config
     */
    constructor(config: MwnErrorConfig);
    static MissingPage: {
        new (config?: Partial<MwnErrorConfig>): {
            name: string;
            message: string;
            stack?: string;
        };
        MissingPage: any;
        captureStackTrace(targetObject: object, constructorOpt?: Function): void;
        prepareStackTrace?: (err: Error, stackTraces: NodeJS.CallSite[]) => any;
        stackTraceLimit: number;
    };
}
