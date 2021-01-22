import type { ApiBlockParams, ApiDeleteParams, ApiEditPageParams, ApiEmailUserParams, ApiMoveParams, ApiParseParams, ApiPurgeParams, ApiQueryAllPagesParams, ApiQueryBacklinkspropParams, ApiQueryCategoryMembersParams, ApiQueryLogEventsParams, ApiQueryRevisionsParams, ApiQueryUserContribsParams, ApiUnblockParams, ApiUndeleteParams } from "./api_params";
import type { logprop, revisionprop } from "./page";
import type { LogEvent, UserContribution } from "./user";
import type { CategoryLink, FileLink, Link, PageLink, Section, Template, TemplateConfig } from "./wikitext";
import type { timeUnit } from "./date";
import type { recentchangeProps } from "./eventstream";
export interface MwnTitleStatic {
    new (title: string, namespace?: number): MwnTitle;
    idNameMap: {
        [namespaceId: number]: string;
    };
    nameIdMap: {
        [namespaceName: string]: number;
    };
    legaltitlechars: string;
    caseSensitiveNamespaces: Array<number>;
    processNamespaceData(json: {
        query: {
            general: {
                legaltitlechars: string;
            };
            namespaces: {
                name: string;
                id: number;
                canonical: boolean;
                case: string;
            }[];
            namespacealiases: {
                alias: string;
                id: number;
            }[];
        };
    }): void;
    checkData(): void;
    newFromText(title: string, namespace?: number): MwnTitle | null;
    makeTitle(namespace: number, title: string): MwnTitle | null;
    isTalkNamespace(namespaceId: number): boolean;
    phpCharToUpper(chr: string): string;
}
export interface MwnTitle {
    title: string;
    namespace: number;
    fragment: string;
    getNamespaceId(): number;
    getMain(): string;
    getMainText(): string;
    getPrefixedDb(): string;
    getPrefixedText(): string;
    getFragment(): string | null;
    isTalkPage(): boolean;
    getTalkPage(): MwnTitle | null;
    getSubjectPage(): MwnTitle | null;
    canHaveTalkPage(): boolean;
    getExtension(): string | null;
    getDotExtension(): string;
    toString(): string;
    toText(): string;
}
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
export interface MwnFileStatic {
    new (title: MwnTitle | string): MwnFile;
}
export interface MwnFile extends MwnPage {
    getName(): string;
    getNameText(): string;
    usages(options?: ApiQueryBacklinkspropParams): Promise<{
        pageid: number;
        title: string;
        redirect: boolean;
    }[]>;
    download(localname: string): void;
}
export interface MwnCategoryStatic {
    new (title: MwnTitle | string): MwnCategory;
}
export interface MwnCategory extends MwnPage {
    members(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }[]>;
    membersGen(options?: ApiQueryCategoryMembersParams): AsyncGenerator<{
        pageid: number;
        ns: number;
        title: string;
    }>;
    pages(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }[]>;
    subcats(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }[]>;
    files(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }[]>;
}
export interface MwnStreamStatic {
    new (streams: string | string[], config: {
        since?: Date | MwnDate | string;
        onopen?: (() => void);
        onerror?: ((evt: MessageEvent) => void);
    }): MwnStream;
    recentchange(filter: Partial<recentchangeProps> | ((data: recentchangeProps) => boolean), action: ((data: recentchangeProps) => void)): MwnStream;
}
export interface MwnStream {
    addListener(filter: ((data: any) => boolean) | any, action: (data: any) => void): void;
}
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
export interface MwnWikitextStatic {
    new (text: string): MwnWikitext;
    parseTemplates(wikitext: string, config: TemplateConfig): Template[];
    parseTable(text: string): {
        [column: string]: string;
    }[];
    parseSections(text: string): Section[];
}
export interface MwnWikitext {
    text: string;
    links: Array<PageLink>;
    templates: Array<Template>;
    files: Array<FileLink>;
    categories: Array<CategoryLink>;
    sections: Array<Section>;
    parseLinks(): void;
    parseTemplates(config: TemplateConfig): Template[];
    removeEntity(entity: Link | Template): void;
    parseSections(): Section[];
    unbind(prefix: string, postfix: string): void;
    rebind(): string;
    getText(): string;
    apiParse(options: ApiParseParams): Promise<string>;
}
export interface MwnDateStatic {
    new (...args: any[]): MwnDate;
    loadLocaleData(data: any): void;
    getMonthName(monthNum: number): string;
    getMonthNameAbbrev(monthNum: number): string;
    getDayName(dayNum: number): string;
    getDayNameAbbrev(dayNum: number): string;
}
export interface MwnDate extends Date {
    isValid(): boolean;
    isBefore(date: Date | MwnDate): boolean;
    isAfter(date: Date | MwnDate): boolean;
    getUTCMonthName(): string;
    getUTCMonthNameAbbrev(): string;
    getMonthName(): string;
    getMonthNameAbbrev(): string;
    getUTCDayName(): string;
    getUTCDayNameAbbrev(): string;
    getDayName(): string;
    getDayNameAbbrev(): string;
    add(number: number, unit: timeUnit): MwnDate;
    subtract(number: number, unit: timeUnit): MwnDate;
    format(formatstr: string, zone?: number | 'utc' | 'system'): string;
    calendar(zone?: number | 'utc' | 'system'): string;
}
