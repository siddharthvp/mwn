export declare type recentchangeProps = {
    wiki: string;
    type: ("edit" | "log" | "new" | "categorize");
    title: string;
    namespace: number;
    user: string;
    bot: boolean;
    minor: boolean;
};
