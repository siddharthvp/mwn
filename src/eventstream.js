const EventSource = require('eventsource');

module.exports = function (mwn, bot) {

	class EventStream extends EventSource {

		/**
		 * Access the Wikimedia EventStreams API
		 * @see https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
		 * @param {string|string[]} streams
		 * @param {Object} [config={}]
		 * @config {string|Date} since
		 * @config {Function} onopen
		 * @config {Function} onerror
		 */
		constructor(streams, config = {}) {
			if (Array.isArray(streams)) {
				streams = streams.join(',');
			}

			let since = config.since ? `?since=${new bot.date(config.since).format('YYYYMMDDHHmmss')}` : '';
			super(`https://stream.wikimedia.org/v2/stream/${streams}${since}`, {
				headers: {
					'User-Agent': bot.options.userAgent
				}
			});

			this.onopen = config.onopen || function () {
				mwn.log(`[S] Opened eventsource connection for ${streams} stream(s)`);
			};
			this.onerror = config.onerror || function (err) {
				mwn.log(`[W] event source encountered error: ${err}`);
			};

		}

		/**
		 * Register a function to trigger for every message data from the source.
		 * @param {Function} action
		 * @param {Function | Object} [filter={}]
		 */
		addListener(action, filter = {}) {
			let filterer = typeof filter === 'function' ?
				filter :
				function(data) {
					for (let key of Object.keys(filter)) {
						if (data[key] !== filter[key]) {
							return false;
						}
					}
					return true;
				};

			this.onmessage = function(event) {
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
		static recentchange(filter, action) {
			let stream = new EventStream('recentchange');
			stream.addListener(action, filter);
			return stream;
		}

	}

	return EventStream;

};
