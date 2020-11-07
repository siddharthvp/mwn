/**
 * Class for some basic wikitext parsing, involving
 * links, files, categories, templates and simple tables
 * and sections.
 *
 * For more advanced and sophisticated wikitext parsing, use
 * mwparserfromhell <https://github.com/earwig/mwparserfromhell>
 * implemented in python (which you can use within node.js using
 * the child_process interface). However, mwparserfromhell doesn't
 * recognize localised namespaces and wiki-specific configs.
 *
 * This class is for methods for parsing wikitext, for the
 * static methods for creating wikitext, see static_utils.js.
 */
import type { MwnTitle } from "./bot";
export interface Link {
    wikitext: string;
    target: MwnTitle;
}
export interface PageLink extends Link {
    displaytext: string;
}
export interface FileLink extends Link {
    props: string;
}
export interface CategoryLink extends Link {
    sortkey: string;
}
export interface Section {
    level: number;
    header: string;
    index: number;
    content?: string;
}
export interface TemplateConfig {
    recursive: boolean;
    namePredicate: ((name: string) => boolean);
    templatePredicate: ((template: Template) => boolean);
    count: number;
}
/**
 * @class
 * Represents the wikitext of template transclusion. Used by #parseTemplates.
 * @prop {string} name Name of the template
 * @prop {string} wikitext Full wikitext of the transclusion
 * @prop {Object[]} parameters Parameters used in the translcusion, in order, of form:
        {
            name: {string|number} parameter name, or position for unnamed parameters,
            value: {string} Wikitext passed to the parameter (whitespace trimmed),
            wikitext: {string} Full wikitext (including leading pipe, parameter name/equals sign (if applicable), value, and any whitespace)
        }
 */
export declare class Template {
    wikitext: string;
    parameters: Array<Parameter>;
    name: string | number;
    /**
     * @param {String} wikitext Wikitext of a template transclusion,
     * starting with '{{' and ending with '}}'.
     */
    constructor(wikitext: string);
    addParam(name: string | number, val: string, wikitext: string): void;
    getParam(paramName: string | number): Parameter;
    getValue(paramName: string | number): string | null;
    setName(name: string): void;
}
export declare class Parameter {
    name: string | number;
    value: string;
    wikitext: string;
    constructor(name: string | number, val: string, wikitext: string);
}
