declare const unitMap: {
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    months: string;
    years: string;
};
export declare type timeUnit = keyof typeof unitMap | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
export {};
