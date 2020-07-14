module.exports = function(bot) {

	class User {

		/**
		 * @constructor
		 * @param {string} name - username
		 */
		constructor(name) {
			this.username = name;
		}

		get userpage() {
			// User: namespace name will work across all MW sites
			// as it is a canonical namespace name
			return new bot.page('User:' + this.username);
		}

		get talkpage() {
			return new bot.page('User talk:' + this.username);
		}

		// XXX: should these yield rather than return?

		/**
		 * Get user's recent contributions
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>}
		 */
		contribs(options) {
			return bot.request(Object.assign({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max'
			}, options)).then(data => data.query.usercontribs);
		}


		/**
		 * Get user's recent log actions
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>}
		 */
		logs(options) {
			return bot.request(Object.assign({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max'
			}, options)).then(data => data.query.logevents);
		}

		/**
		 * Get public information about the user
		 * @param {Array} props - properties to fetch
		 * @returns {Promise<Object>}
		 */
		info(props) {
			return bot.request({
				action: 'query',
				list: 'users',
				ususers: this.username,
				usprop: props || 'editcount|registration|blockinfo|emailable|gender|' +
					'rights|groups|groupmemberships|implicitgroups'
			}).then(data => data.query.users[0]);
		}

		/**
		 * Post a message on user's talk page
		 * @param {string} header
		 * @param {string} message
		 * @returns {Promise}
		 */
		sendMessage(header, message) {
			return this.talkpage.newSection(header, message);
		}


		/**
		 * Send the user an email
		 * @param {string} subject
		 * @param {string} message
		 * @returns {Promise}
		 */
		email(subject, message) {
			return this.request({
				action: 'emailuser',
				target: this.username,
				subject: subject,
				text: message,
				token: this.csrfToken
			}).then(data => data.emailuser);
		}

		/**
		 * Block the user
		 * @param {Object} options - additional API options
		 */
		block(options) {
			return bot.request(Object.assign({
				action: 'block',
				user: this.username,
				token: this.csrfToken
			}, options)).then(data => data.block);
		}

		/**
		 * Unblock the user
		 * @param {Object} options - additional API options
		 */
		unblock(options) {
			return bot.request(Object.assign({
				action: 'unblock',
				user: this.username,
				token: this.csrfToken
			}, options)).then(data => data.unblock);
		}

	}

	return User;

};