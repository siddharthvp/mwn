export declare type UserContribution = {
    userid: number;
    user: string;
    pageid: number;
    revid: number;
    parentid: number;
    ns: number;
    title: string;
    timestamp: string;
    new: boolean;
    minor: boolean;
    top: boolean;
    comment: string;
    size: number;
};
export declare type LogEvent = {
    logid: number;
    ns: number;
    title: string;
    pageid: number;
    logpage: number;
    params: any;
    type: string;
    action: string;
    user: string;
    timestamp: string;
    comment: string;
};
