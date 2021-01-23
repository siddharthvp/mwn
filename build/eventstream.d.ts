import type { mwn as Mwn, MwnDate } from './bot';
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
export declare type recentchangeProps = {
    wiki: string;
    type: ("edit" | "log" | "new" | "categorize");
    title: string;
    namespace: number;
    user: string;
    bot: boolean;
    minor: boolean;
};
export default function (bot: Mwn, mwn: typeof Mwn): MwnStreamStatic;
