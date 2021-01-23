import type { mwn, MwnPage, MwnTitle } from './bot';
import { ApiQueryCategoryMembersParams } from "./api_params";
declare type ApiPageInfo = {
    pageid: number;
    ns: number;
    title: string;
};
export interface MwnCategoryStatic {
    new (title: MwnTitle | string): MwnCategory;
}
export interface MwnCategory extends MwnPage {
    members(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
    membersGen(options?: ApiQueryCategoryMembersParams): AsyncGenerator<ApiPageInfo>;
    pages(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
    subcats(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
    files(options?: ApiQueryCategoryMembersParams): Promise<ApiPageInfo[]>;
}
export default function (bot: mwn): MwnCategoryStatic;
export {};
