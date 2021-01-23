import type { mwn, MwnTitle } from './bot';
import type { ApiDeleteParams, ApiEditPageParams, ApiMoveParams, ApiPurgeParams, ApiQueryAllPagesParams, ApiQueryLogEventsParams, ApiQueryRevisionsParams, ApiUndeleteParams } from "./api_params";
export declare type revisionprop = "content" | "timestamp" | "user" | "comment" | "parsedcomment" | "ids" | "flags" | "size" | "tags" | "userid" | "contentmodel";
export declare type logprop = "type" | "user" | "comment" | "details" | "timestamp" | "title" | "parsedcomment" | "ids" | "tags" | "userid";
export interface MwnPageStatic {
    new (title: MwnTitle | string, namespace?: number): MwnPage;
}
export interface MwnPage extends MwnTitle {
    data: any;
    getTalkPage(): MwnPage;
    getSubjectPage(): MwnPage;
    text(): Promise<string>;
    categories(): Promise<{
        sortkey: string;
        category: string;
        hidden: boolean;
    }[]>;
    templates(): Promise<{
        ns: number;
        title: string;
        exists: boolean;
    }[]>;
    links(): Promise<{
        ns: number;
        title: string;
        exists: boolean;
    }[]>;
    backlinks(): Promise<string[]>;
    transclusions(): Promise<string[]>;
    images(): Promise<string[]>;
    externallinks(): Promise<string[]>;
    subpages(options?: ApiQueryAllPagesParams): Promise<string[]>;
    isRedirect(): Promise<boolean>;
    getRedirectTarget(): Promise<string>;
    getCreator(): Promise<string>;
    getDeletingAdmin(): Promise<string>;
    getDescription(customOptions?: any): Promise<string>;
    history(props: revisionprop[] | revisionprop, limit: number, customOptions?: ApiQueryRevisionsParams): Promise<object[]>;
    logs(props: logprop | logprop[], limit?: number, type?: string, customOptions?: ApiQueryLogEventsParams): Promise<object[]>;
    edit(transform: ((rev: {
        content: string;
        timestamp: string;
    }) => string | object)): Promise<any>;
    save(text: string, summary?: string, options?: ApiEditPageParams): Promise<any>;
    newSection(header: string, message: string, additionalParams?: ApiEditPageParams): Promise<any>;
    move(target: string, summary: string, options?: ApiMoveParams): Promise<any>;
    delete(summary: string, options?: ApiDeleteParams): Promise<any>;
    undelete(summary: string, options?: ApiUndeleteParams): Promise<any>;
    purge(options?: ApiPurgeParams): Promise<any>;
}
export default function (bot: mwn): MwnPageStatic;
