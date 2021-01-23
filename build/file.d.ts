import type { mwn, MwnPage, MwnTitle } from './bot';
import { ApiQueryBacklinkspropParams } from "./api_params";
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
export default function (bot: mwn): MwnFileStatic;
