/**
 *
 * This class is a substantial copy of mw.Title in the MediaWiki on-site
 * JS interface.
 *
 * Adapted from <https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/master/resources/src/mediawiki.Title/>
 * (GNU GPL v2)
 *
 */
import type { mwn } from "./bot";
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
export default function (bot: mwn): MwnTitleStatic;
