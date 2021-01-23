import type { mwn } from "./bot";
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
/**
 * Wrapper around the native JS Date() for ease of
 * handling dates, as well as a constructor that
 * can parse MediaWiki dating formats.
 */
export default function (bot: mwn): MwnDateStatic;
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
