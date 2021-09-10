import * as EventSource from 'eventsource';
import type { mwn } from './bot';
import type { MwnDate } from './date';
import { log } from './log';

export interface MwnStreamStatic {
	new (
		streams: string | string[],
		config: {
			since?: Date | MwnDate | string;
			onopen?: () => void;
			onerror?: (evt: MessageEvent) => void;
		}
	): MwnStream;

	recentchange(
		filter: Partial<RecentChangeStreamEvent> | ((data: RecentChangeStreamEvent) => boolean),
		action: (data: RecentChangeStreamEvent) => void
	): MwnStream;
}

export interface MwnStream {
	/**
	 * Register a function to trigger for every message data from the source.
	 * @param {Function | Object} [filter={}]
	 * @param {Function} action
	 */
	addListener(filter: ((data: any) => boolean) | any, action: (data: any) => void): void;
}

/**
 * Represents an event in the recentchange stream.
 */
export type RecentChangeStreamEvent = {
	$schema: string;
	meta: {
		uri: string;
		request_id: string;
		id: string;
		dt: string;
		domain: string;
		stream: string;
		topic: string;
		partition: number;
		offset: number;
	};

	type: 'edit' | 'log' | 'categorize' | 'new';

	namespace: number;
	title: string;
	comment: string;
	parsedcomment: string;
	timestamp: number;
	user: string;
	bot: boolean;
	wiki: string;
	server_url: string;
	server_name: string;
	server_script_path: string;

	// present for type=edit, categorize, new
	id: number;

	// present type=edit, new
	minor: boolean;
	patrolled: boolean;
	length: {
		old: number; // not present for type=new
		new: number;
	};
	revision: {
		old: number; // not present for type=new
		new: number;
	};

	// present for type=log
	log_id: number;
	log_type: string;
	log_action: string;
	log_params: any;
	log_action_comment: string;
};

/**
 * @deprecated
 * Renamed to RecentChangeStreamEvent
 */
export type recentchangeProps = RecentChangeStreamEvent;

export default function (bot: mwn) {
	class EventStream extends EventSource implements MwnStream {
		/**
		 * Access the Wikimedia EventStreams API
		 * @see https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
		 */
		constructor(
			streams: string | string[],
			config: {
				since?: Date | MwnDate | string;
				onopen?: () => void;
				onerror?: (evt: MessageEvent) => void;
			} = {}
		) {
			if (Array.isArray(streams)) {
				streams = streams.join(',');
			}

			let since = config.since ? `?since=${new bot.date(config.since).toISOString()}` : '';
			super(`https://stream.wikimedia.org/v2/stream/${streams}${since}`, {
				headers: {
					'User-Agent': bot.options.userAgent,
				},
			});
			this.onopen =
				config.onopen ||
				function () {
					log(`[S] Opened eventsource connection for ${streams} stream(s)`);
				};
			this.onerror =
				config.onerror ||
				function (evt) {
					log(`[W] event source encountered error:`);
					log(evt);
				};
		}

		/** @inheritDoc */
		addListener(filter: ((data: any) => boolean) | any = {}, action: (data: any) => void): void {
			let filterer =
				typeof filter === 'function'
					? filter
					: function (data: any) {
							for (let key of Object.keys(filter)) {
								if (data[key] !== filter[key]) {
									return false;
								}
							}
							return true;
					  };

			this.onmessage = function (event: { data: string }) {
				let data = JSON.parse(event.data);
				if (!filterer(data)) {
					return;
				}
				action(data);
			};
		}

		/**
		 * Access the recentchange EventStreams API
		 * @see https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
		 * @param {{wiki: string, type: ("edit"|"log"|"new"|"categorize"), title: string, namespace: number,
		 * user: string, bot: boolean, minor: boolean} | Function} filter
		 * @param {Function} action
		 */
		static recentchange(
			filter: Partial<RecentChangeStreamEvent> | ((data: RecentChangeStreamEvent) => boolean),
			action: (data: RecentChangeStreamEvent) => void
		): EventStream {
			let stream = new EventStream('recentchange');
			stream.addListener(filter, action);
			return stream;
		}
	}

	return EventStream as MwnStreamStatic;
}
