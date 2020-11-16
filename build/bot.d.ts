/**
 *
 *  mwn: a MediaWiki bot framework for Node.js
 *
 * 	Copyright (C) 2020 Siddharth VP
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/**
 * Attributions:
 * Parts of the code are adapted from MWBot <https://github.com/Fannon/mwbot/src/index.js>
 * released under the MIT license. Copyright (c) 2015-2018 Simon Heimler.
 *
 * Some parts are copied from the mediawiki.api module in mediawiki core
 * <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.api>
 * released under GNU GPL v2.
 *
 */
import { AxiosRequestConfig } from 'axios';
import tough = require('tough-cookie');
import OAuth = require('oauth-1.0a');
import { MwnError, MwnErrorConfig } from "./error";
import type { Link, CategoryLink, FileLink, PageLink, Template, TemplateConfig, Section } from "./wikitext";
import type { revisionprop, logprop } from './page';
import type { LogEvent, UserContribution } from "./user";
import type { recentchangeProps } from "./eventstream";
import type { timeUnit } from "./date";
import type { ApiDeleteParams, ApiEditPageParams, ApiMoveParams, ApiParseParams, ApiPurgeParams, ApiQueryAllPagesParams, ApiQueryCategoryMembersParams, ApiQuerySearchParams, ApiRollbackParams, ApiUndeleteParams, ApiUploadParams, ApiEmailUserParams, ApiQueryRevisionsParams, ApiQueryLogEventsParams, ApiQueryBacklinkspropParams, ApiQueryUserContribsParams, ApiBlockParams, ApiUnblockParams } from "./api_params";
export interface RawRequestParams extends AxiosRequestConfig {
    retryNumber?: number;
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
export interface MwnPage extends MwnTitle {
    data: any;
    getTalkPage(): MwnPage;
    getSubjectPage(): MwnPage;
    text(): Promise<string>;
    categories(): Promise<{
        sortkey: string;
        category: string;
        hidden: boolean;
    }>;
    templates(): Promise<{
        ns: number;
        title: string;
        exists: boolean;
    }>;
    links(): Promise<{
        ns: number;
        title: string;
        exists: boolean;
    }>;
    backlinks(): Promise<string[]>;
    transclusions(): Promise<string[]>;
    images(): Promise<string[]>;
    externallinks(): Promise<string[]>;
    subpages(options?: ApiQueryAllPagesParams): Promise<string[]>;
    isRedirect(): Promise<boolean>;
    getRedirectTarget(): Promise<string>;
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
export interface MwnFile extends MwnPage {
    getName(): string;
    getNameText(): string;
    usages(options?: ApiQueryBacklinkspropParams): Promise<{
        pageid: number;
        title: string;
        redirect: boolean;
    }>;
    download(localname: string): void;
}
export interface MwnCategory extends MwnPage {
    members(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }>;
    pages(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }>;
    subcats(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }>;
    files(options?: ApiQueryCategoryMembersParams): Promise<{
        pageid: number;
        ns: number;
        title: string;
    }>;
}
export interface MwnStream {
    addListener(filter: ((data: any) => boolean) | any, action: (data: any) => void): void;
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
export interface MwnOptions {
    silent?: boolean;
    apiUrl?: string;
    userAgent?: string;
    username?: string;
    password?: string;
    OAuthCredentials?: {
        consumerToken: string;
        consumerSecret: string;
        accessToken: string;
        accessSecret: string;
    };
    maxRetries?: number;
    retryPause?: number;
    shutoff?: {
        intervalDuration?: number;
        page?: string;
        condition?: RegExp | ((text: string) => boolean);
        onShutoff?: ((text: string) => void);
    };
    defaultParams?: ApiParams;
    suppressAPIWarnings?: boolean;
    editConfig?: editConfigType;
    suppressInvalidDateWarning?: boolean;
    semlog?: object;
}
declare type editConfigType = {
    conflictRetries?: number;
    suppressNochangeWarning?: boolean;
    exclusionRegex?: RegExp;
};
export declare type ApiParams = {
    [param: string]: string | string[] | boolean | number | number[] | MwnDate | {
        stream: ReadableStream;
        name: string;
    };
};
export declare type ApiResponse = any;
export interface ApiPage {
    title: string;
    missing?: boolean;
    invalid?: boolean;
    revisions: ApiRevision[];
}
export interface ApiRevision {
    content: string;
    timestamp: string;
    slots?: {
        main: {
            content: string;
            timestamp: string;
        };
    };
}
declare type ApiEditResponse = {
    result: string;
    pageid: number;
    title: string;
    contentmodel: string;
    nochange?: boolean;
    oldrevid: number;
    newrevid: number;
    newtimestamp: string;
};
export declare class mwn {
    /**
     * Bot instance Login State
     * Is received from the MW Login API and contains token, userid, etc.
     */
    state: any;
    /**
     * Bot instance is logged in or not
     */
    loggedIn: boolean;
    /**
     * Bot instance's edit token.
     */
    csrfToken: string;
    /**
     * Default options.
     * Should be immutable
     */
    readonly defaultOptions: MwnOptions;
    options: MwnOptions;
    cookieJar: tough.CookieJar;
    static requestDefaults: RawRequestParams;
    requestOptions: RawRequestParams;
    shutoff: {
        state: boolean;
        hook: ReturnType<typeof setInterval>;
    };
    hasApiHighLimit: boolean;
    oauth: OAuth;
    usingOAuth: boolean;
    title: {
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
    };
    page: {
        new (title: string, namespace?: number): MwnPage;
    };
    file: {
        new (title: string): MwnFile;
    };
    category: {
        new (title: string): MwnCategory;
    };
    stream: {
        new (streams: string | string[], config: {
            since?: Date | MwnDate | string;
            onopen?: (() => void);
            onerror?: ((evt: MessageEvent) => void);
        }): MwnStream;
        recentchange(filter: Partial<recentchangeProps> | ((data: recentchangeProps) => boolean), action: ((data: recentchangeProps) => void)): MwnStream;
    };
    date: {
        new (...args: any[]): MwnDate;
        loadLocaleData(data: any): void;
        getMonthName(monthNum: number): string;
        getMonthNameAbbrev(monthNum: number): string;
        getDayName(dayNum: number): string;
        getDayNameAbbrev(dayNum: number): string;
    };
    wikitext: {
        new (text: string): MwnWikitext;
        parseTemplates(wikitext: string, config: TemplateConfig): Template[];
        parseTable(text: string): {
            [column: string]: string;
        }[];
        parseSections(text: string): Section[];
    };
    user: {
        new (username: string): MwnUser;
    };
    static Error: typeof MwnError;
    static log: (data: any) => void;
    static link: (target: string | MwnTitle, displaytext?: string) => string;
    static template: (title: string | MwnTitle, parameters?: {
        [parameter: string]: string;
    }) => string;
    static table: {
        new (config?: {
            plain?: boolean;
            sortable?: boolean;
            style?: string;
            multiline?: boolean;
        }): {
            text: string;
            multiline: boolean;
            _makecell(cell: string | {
                [attribute: string]: string;
            }, isHeader?: boolean): string;
            addHeaders(headers: (string | {
                [attribute: string]: string;
            })[]): void;
            addRow(fields: string[], attributes?: {
                [attribute: string]: string;
            }): void;
            getText(): string;
        };
    };
    static util: {
        escapeRegExp: (str: string) => string;
        escapeHtml: (s: string) => string;
        rawurlencode: (str: string) => string;
        wikiUrlencode: (str: string) => string;
        isIPv4Address: (address: string, allowBlock?: boolean) => boolean;
        isIPv6Address: (address: string, allowBlock?: boolean) => boolean;
        isIPAddress: (address: string, allowBlock?: boolean) => boolean;
    };
    /***************** CONSTRUCTOR ********************/
    /**
     * Constructs a new bot instance
     * It is advised to create one bot instance for every API to use
     * A bot instance has its own state (e.g. tokens) that is necessary for some operations
     *
     * @param {Object} [customOptions] - Custom options
     */
    constructor(customOptions?: MwnOptions);
    /**
     * Initialize a bot object. Login to the wiki and fetch editing tokens.
     * Also fetches the site data needed for parsing and constructing title objects.
     * @param {Object} config - Bot configurations, including apiUrl, and either the
     * username and password or the OAuth credentials
     * @returns {Promise<mwn>} bot object
     */
    static init(config: MwnOptions): Promise<mwn>;
    /**
     * Set and overwrite mwn options
     * @param {Object} customOptions
     */
    setOptions(customOptions: MwnOptions): void;
    /**
     * Sets the API URL for MediaWiki requests
     * This can be uses instead of a login, if no actions are used that require login.
     * @param {string} apiUrl - API url to MediaWiki, e.g. https://en.wikipedia.org/w/api.php
     */
    setApiUrl(apiUrl: string): void;
    /**
     * Sets and overwrites the raw request options, used by the axios library
     * See https://www.npmjs.com/package/axios
     */
    setRequestOptions(customRequestOptions: RawRequestParams): any;
    /**
     * Set the default parameters to be sent in API calls.
     * @param {Object} params - default parameters
     */
    setDefaultParams(params: ApiParams): void;
    /**
     * Set your API user agent. See https://meta.wikimedia.org/wiki/User-Agent_policy
     * Required for WMF wikis.
     * @param {string} userAgent
     */
    setUserAgent(userAgent: string): void;
    /**
     * @private
     * Determine if we're going to use OAuth for authentication
     */
    _usingOAuth(): boolean;
    /**
     * Initialize OAuth instance
     */
    initOAuth(): void;
    /**
     * @private
     * Get OAuth Authorization header
     */
    makeOAuthHeader(params: OAuth.RequestOptions): OAuth.Header;
    /************ CORE REQUESTS ***************/
    /**
     * Executes a raw request
     * Uses the axios library
     * @param {Object} requestOptions
     * @returns {Promise}
     */
    rawRequest(requestOptions: RawRequestParams): Promise<any>;
    /**
     * Executes a request with the ability to use custom parameters and custom
     * request options
     * @param {Object} params
     * @param {Object} [customRequestOptions={}]
     * @returns {Promise}
     */
    request(params: ApiParams, customRequestOptions?: RawRequestParams): Promise<any>;
    /** @private */
    dieWithError(response: any, requestOptions: RawRequestParams): Promise<never>;
    /************** CORE FUNCTIONS *******************/
    /**
     * Executes a Login
     * @see https://www.mediawiki.org/wiki/API:Login
     * @returns {Promise}
     */
    login(loginOptions?: {
        username?: string;
        password?: string;
        apiUrl?: string;
    }): Promise<any>;
    /**
     * Log out of the account
     * @returns {Promise<void>}
     */
    logout(): Promise<void>;
    /**
     * Gets namespace-related information for use in title nested class.
     * This need not be used if login() is being used. This is for cases
     * where mwn needs to be used without logging in.
     * @returns {Promise<void>}
     */
    getSiteInfo(): Promise<void>;
    /**
     * Get tokens and saves them in this.state
     * @returns {Promise<void>}
     */
    getTokens(): Promise<void>;
    /**
     * Gets an edit token (also used for most other actions
     * such as moving and deleting)
     * This is only compatible with MW >= 1.24
     * @returns {Promise<string>}
     */
    getCsrfToken(): Promise<string>;
    /**
     * Get the tokens and siteinfo in one request
     * @returns {Promise<void>}
     */
    getTokensAndSiteInfo(): Promise<void>;
    /**
     * Get type of token to be used with an API action
     * @param {string} action - API action parameter
     * @returns {Promise<string>}
     */
    getTokenType(action: string): Promise<string>;
    /**
     * Combines Login  with getCsrfToken
     * @param [loginOptions]
     * @returns {Promise<void>}
     */
    loginGetToken(loginOptions?: any): Promise<void>;
    /**
     * Get the wiki's server time
     * @returns {Promise<string>}
     */
    getServerTime(): Promise<string>;
    /**
     * Fetch and parse a JSON wikipage
     * @param {string} title - page title
     * @returns {Promise<Object>} parsed JSON object
     */
    parseJsonPage(title: string): Promise<any>;
    /**
     * Enable bot emergency shutoff
     */
    enableEmergencyShutoff(shutoffOptions?: {
        page?: string;
        intervalDuration?: number;
        condition?: RegExp | ((text: string) => boolean);
        onShutoff?: ((text: string) => void);
    }): void;
    /**
     * Disable emergency shutoff detection.
     * Use this only if it was ever enabled.
     */
    disableEmergencyShutoff(): void;
    /***************** HELPER FUNCTIONS ******************/
    /**
     * Reads the content and and meta-data of one (or many) pages.
     * Content from the "main" slot is copied over to every revision object
     * for easier referencing (`pg.revisions[0].content` can be used instead of
     * `pg.revisions[0].slots.main.content`).
     *
     * @param {string|string[]|number|number[]} titles - for multiple pages use an array
     * @param {Object} [options]
     * @returns {Promise<ApiPage>}
     */
    read(titles: string | number | MwnTitle, options?: ApiParams): Promise<ApiPage>;
    read(titles: string[] | number[] | MwnTitle[], options?: ApiParams): Promise<ApiPage[]>;
    readGen(titles: string[], options?: ApiParams): AsyncGenerator<ApiPage>;
    /**
    * @param {string|number|MwnTitle} title - Page title or page ID or MwnTitle object
    * @param {Function} transform - Callback that prepares the edit. It takes one
    * argument that is an { content: 'string: page content', timestamp: 'string:
    * time of last edit' } object. This function should return an object with
    * edit API parameters or just the updated text, or a promise providing one of
    * those.
    * @param {Object} [editConfig] - Overridden edit options. Available options:
    * conflictRetries, suppressNochangeWarning, exclusionRegex
    * @config conflictRetries - maximum number of times to retry edit after encountering edit
    * conflicts.
    * @config suppressNochangeWarning - don't show the warning when no change is actually
    * made to the page on an successful edit
    * @config exclusionRegex - don't edit if the page text matches this regex. Used for bot
    * per-page exclusion compliance.
    * @return {Promise<Object>} Edit API response
    */
    edit(title: string | number, transform: ((rev: {
        content: string;
        timestamp: string;
    }) => string | ApiEditPageParams), editConfig?: editConfigType): Promise<ApiEditResponse>;
    /**
     * Edit a page without loading it first. Straightforward version of `edit`.
     * No edit conflict detection.
     *
     * @param {string|number}  title - title or pageid (as number)
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [options]
     * @returns {Promise}
     */
    save(title: string | number, content: string, summary?: string, options?: ApiEditPageParams): Promise<ApiEditResponse>;
    /**
     * Creates a new pages. Does not edit existing ones
     *
     * @param {string}  title
     * @param {string}  content
     * @param {string}  [summary]
     * @param {object}  [options]
     *
     * @returns {Promise}
     */
    create(title: string, content: string, summary?: string, options?: ApiEditPageParams): Promise<ApiEditResponse>;
    /**
     * Post a new section to the page.
     *
     * @param {string|number} title - title or pageid (as number)
     * @param {string} header
     * @param {string} message wikitext message
     * @param {Object} [additionalParams] Additional API parameters, e.g. `{ redirect: true }`
     */
    newSection(title: string | number, header: string, message: string, additionalParams?: ApiEditPageParams): Promise<ApiEditResponse>;
    /**
     * Deletes a page
     *
     * @param {string|number}  title - title or pageid (as number)
     * @param {string}  [summary]
     * @param {object}  [options]
     * @returns {Promise}
     */
    delete(title: string | number, summary: string, options?: ApiDeleteParams): Promise<ApiResponse>;
    /**
     * Undeletes a page.
     * Note: all deleted revisions of the page will be restored.
     *
     * @param {string}  title
     * @param {string}  [summary]
     * @param {object}  [options]
     * @returns {Promise}
     */
    undelete(title: string, summary: string, options?: ApiUndeleteParams): Promise<ApiResponse>;
    /**
     * Moves a new page
     *
     * @param {string}  fromtitle
     * @param {string}  totitle
     * @param {string}  [summary]
     * @param {object}  [options]
     */
    move(fromtitle: string, totitle: string, summary: string, options?: ApiMoveParams): Promise<ApiResponse>;
    /**
     * Parse wikitext. Convenience method for 'action=parse'.
     *
     * @param {string} content Content to parse.
     * @param {Object} additionalParams Parameters object to set custom settings, e.g.
     *   redirects, sectionpreview.  prop should not be overridden.
     * @return {Promise<string>}
     */
    parseWikitext(content: string, additionalParams?: ApiParseParams): Promise<string>;
    /**
     * Parse a given page. Convenience method for 'action=parse'.
     *
     * @param {string} title Title of the page to parse
     * @param {Object} additionalParams Parameters object to set custom settings, e.g.
     *   redirects, sectionpreview.  prop should not be overridden.
     * @return {Promise<string>}
     */
    parseTitle(title: string, additionalParams?: ApiParseParams): Promise<string>;
    /**
     * Upload an image from a the local disk to the wiki.
     * If a file with the same name exists, it will be over-written.
     * @param {string} filepath
     * @param {string} title
     * @param {string} text
     * @param {object} options
     * @returns {Promise<Object>}
     */
    upload(filepath: string, title: string, text: string, options?: ApiUploadParams): Promise<ApiResponse>;
    /**
     * Upload an image from a web URL to the wiki
     * If a file with the same name exists, it will be over-written,
     * to disable this behaviour, use `ignorewarning: false` in options.
     * @param {string} url
     * @param {string} title
     * @param {string} text
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    uploadFromUrl(url: string, title: string, text: string, options?: ApiUploadParams): Promise<ApiResponse>;
    /**
     * Download an image from the wiki.
     * If you're downloading multiple images, then for better efficiency, you may want
     * to query the API for the urls of all images in one request, and follow that with
     * running downloadFromUrl for each one.
     * @param {string|number} file - title or page ID
     * @param {string} [localname] - local path (with file name) to download to,
     * defaults to current directory with same file name as on the wiki.
     * @returns {Promise<void>}
     */
    download(file: string | number, localname: string): Promise<void>;
    /**
     * Download an image from a URL.
     * @param {string} url
     * @param {string} [localname] - local path (with file name) to download to,
     * defaults to current directory with same file name as that of the web image.
     * @returns {Promise<void>}
     */
    downloadFromUrl(url: string, localname: string): Promise<void>;
    /**
     * Convenience method for `action=rollback`.
     *
     * @param {string|number} page - page title or page id as number or MwnTitle object
     * @param {string} user
     * @param {Object} [params] Additional parameters
     * @return {Promise}
     */
    rollback(page: string | number, user: string, params?: ApiRollbackParams): Promise<ApiResponse>;
    /**
     * Purge one or more pages (max 500 for bots, 50 for others)
     *
     * @param {String[]|String|number[]|number} titles - page titles or page ids
     * @param {Object} options
     * @returns {Promise}
     */
    purge(titles: string[] | string | number[] | number, options?: ApiPurgeParams): Promise<ApiResponse>;
    /**
     * Get pages with names beginning with a given prefix
     * @param {string} prefix
     * @param {Object} otherParams
     *
     * @returns {Promise<string[]>} - array of page titles (upto 5000 or 500)
     */
    getPagesByPrefix(prefix: string, otherParams?: ApiQueryAllPagesParams): Promise<string[]>;
    /**
     * Get pages in a category
     * @param {string} category - name of category, with or without namespace prefix
     * @param {Object} [otherParams]
     * @returns {Promise<string[]>}
     */
    getPagesInCategory(category: string, otherParams?: ApiQueryCategoryMembersParams): Promise<string[]>;
    /**
     * Search the wiki.
     * @param {string} searchTerm
     * @param {number} limit
     * @param {("size"|"timestamp"|"worcount"|"snippet"|"redirectitle"|"sectiontitle"|
     * "redirectsnippet"|"titlesnippet"|"sectionsnippet"|"categorysnippet")[]} props
     * @param {Object} otherParams
     * @returns {Promise<Object>}
     */
    search(searchTerm: string, limit: number, props: ("size" | "timestamp" | "worcount" | "snippet" | "redirectitle" | "sectiontitle" | "redirectsnippet" | "titlesnippet" | "sectionsnippet" | "categorysnippet")[], otherParams?: ApiQuerySearchParams): Promise<ApiResponse>;
    /************* BULK PROCESSING FUNCTIONS ************/
    /**
     * Send an API query that automatically continues till the limit is reached.
     *
     * @param {Object} query - The API query
     * @param {number} [limit=10] - limit on the maximum number of API calls to go through
     * @returns {Promise<Object[]>} - resolved with an array of responses of individual calls.
     */
    continuedQuery(query?: ApiParams, limit?: number): Promise<ApiResponse[]>;
    /**
     * Generator to iterate through API response continuations.
     * @generator
     * @param {Object} query
     * @param {number} [limit=Infinity]
     * @yields {Object} a single page of the response
     */
    continuedQueryGen(query?: ApiParams, limit?: number): AsyncGenerator<ApiResponse>;
    /**
     * Function for using API action=query with more than 50/500 items in multi-
     * input fields.
     *
     * Multi-value fields in the query API take multiple inputs as an array
     * (internally converted to a pipe-delimted string) but with a limit of 500
     * (or 50 for users without apihighlimits).
     * Example: the fields titles, pageids and revids in any query, ususers in
     * list=users.
     *
     * This function allows you to send a query as if this limit didn't exist.
     * The array given to the multi-input field is split into batches and individual
     * queries are sent sequentially for each batch.
     * A promise is returned finally resolved with the array of responses of each
     * API call.
     *
     * The API calls are made via POST instead of GET to avoid potential 414 (URI
     * too long) errors.
     *
     * @param {Object} query - the query object, the multi-input field should
     * be an array
     * @param {string} [batchFieldName=titles] - the name of the multi-input field
     *
     * @returns {Promise<Object[]>} - promise resolved when all the API queries have
     * settled, with the array of responses.
     */
    massQuery(query?: ApiParams, batchFieldName?: string): Promise<ApiResponse[]>;
    /**
     * Generator version of massQuery(). Iterate through pages of API results.
     * @param {Object} query
     * @param {string} [batchFieldName=titles]
     * @param {number} [batchSize]
     */
    massQueryGen(query: ApiParams, batchFieldName?: string, batchSize?: number): AsyncGenerator<ApiResponse>;
    /**
     * Execute an asynchronous function on a large number of pages (or other arbitrary
     * items). Designed for working with promises.
     *
     * @param {Array} list - list of items to execute actions upon. The array would
     * usually be of page names (strings).
     * @param {Function} worker - function to execute upon each item in the list. Must
     * return a promise.
     * @param {number} [concurrency=5] - number of concurrent operations to take place.
     * Set this to 1 for sequential operations. Default 5. Set this according to how
     * expensive the API calls made by worker are.
     * @param {number} [retries=0] - max number of times failing actions should be retried.
     * @returns {Promise<Object>} - resolved when all API calls have finished, with object
     * { failures: [ ...list of failed items... ] }
     */
    batchOperation<T>(list: T[], worker: ((item: T, index: number) => Promise<any>), concurrency?: number, retries?: number): Promise<{
        failures: {
            [item: string]: Error;
        };
    }>;
    /**
     * Execute an asynchronous function on a number of pages (or other arbitrary items)
     * sequentially, with a time delay between actions.
     * Using this with delay=0 is same as using batchOperation with batchSize=1
     * Use of seriesBatchOperation() is not recommended for MediaWiki API actions. Use the
     * normal mwn methods with async-await in a for loop. The request() method has the better
     * retry functionality (only network errors are retried, other errors are unlikely to go
     * away on retries).
     * @param {Array} list
     * @param {Function} worker - must return a promise
     * @param {number} [delay=5000] - number of milliseconds of delay
     * @param {number} [retries=0] - max number of times failing actions should be retried.
     * @returns {Promise<Object>} - resolved when all API calls have finished, with object
     * { failures: { failed item: error, failed item2: error2, ... } }
     */
    seriesBatchOperation<T>(list: T[], worker: ((item: T, index: number) => Promise<any>), delay?: number, retries?: number): Promise<{
        failures: {
            [item: string]: Error;
        };
    }>;
    /********** SUPPLEMENTARY FUNCTIONS **************/
    /**
     * Execute an ASK Query
     * On a wiki that supports them, like semantic-mediawiki
     *
     * @param {string} query
     * @param {string} [apiUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {Promise}
     */
    askQuery(query: string, apiUrl: string, customRequestOptions?: RawRequestParams): Promise<any>;
    /**
     * Executes a SPARQL Query
     * On a wiki that supports them, like wikidata
     *
     * @param {string} query
     * @param {string} [endpointUrl]
     * @param {object} [customRequestOptions]
     *
     * @returns {Promise}
     */
    sparqlQuery(query: string, endpointUrl: string, customRequestOptions?: RawRequestParams): Promise<any>;
    /**
     * Gets ORES predictions from revision IDs
     * @param {string} endpointUrl
     * @param {string[]} models
     * @param {string[]|number[]|string|number} revisions  ID(s)
     */
    oresQueryRevisions(endpointUrl: string, models: string[], revisions: string[] | number[] | string | number): Promise<any>;
    /**
     * Query the top contributors to the article using the WikiWho API.
     * This API has a throttling of 2000 requests a day.
     * Supported for EN, DE, ES, EU, TR Wikipedias only
     * @see https://api.wikiwho.net/
     */
    queryAuthors(title: string): Promise<{
        totalBytes: number;
        users: ({
            id: number;
            name: string;
            bytes: number;
            percent: number;
        })[];
    }>;
    /**
    * Promisified version of setTimeout
    * @param {number} duration - of sleep in milliseconds
    */
    sleep(duration: number): Promise<void>;
    /**
     * Returns a promise rejected with an error object
     * @private
     * @param {string} errorCode
     * @returns {Promise<mwn.Error>}
     */
    rejectWithErrorCode(errorCode: string): Promise<MwnError>;
    rejectWithError(errorConfig: MwnErrorConfig): Promise<MwnError>;
}
export {};
