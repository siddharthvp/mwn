import type { mwn, MwnPage } from "./bot";
import type { ApiBlockParams, ApiEmailUserParams, ApiQueryLogEventsParams, ApiQueryUserContribsParams, ApiUnblockParams } from "./api_params";
export interface MwnUserStatic {
    new (username: string): MwnUser;
}
export interface MwnUser {
    username: string;
    userpage: MwnPage;
    talkpage: MwnPage;
    contribs(options?: ApiQueryUserContribsParams): Promise<UserContribution[]>;
    contribsGen(options?: ApiQueryUserContribsParams): AsyncGenerator<UserContribution>;
    logs(options?: ApiQueryLogEventsParams): Promise<LogEvent[]>;
    logsGen(options?: ApiQueryLogEventsParams): AsyncGenerator<LogEvent>;
    info(props?: string | string[]): Promise<any>;
    globalinfo(props?: ("groups" | "rights" | "merged" | "unattached" | "editcount")[]): Promise<any>;
    sendMessage(header: string, message: string): Promise<any>;
    email(subject: string, message: string, options?: ApiEmailUserParams): Promise<any>;
    block(options: ApiBlockParams): Promise<any>;
    unblock(options: ApiUnblockParams): Promise<any>;
}
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
export default function (bot: mwn): MwnUserStatic;
