import type {mwn, Page} from "./bot";

module.exports = function(bot: mwn) {

	class User {
		username: string

		/**
		 * @constructor
		 * @param {string} name - username
		 */
		constructor(name: string) {
			this.username = name;
		}

		get userpage(): Page {
			// User: namespace name will work across all MW sites
			// as it is a canonical namespace name
			return new bot.page('User:' + this.username);
		}

		get talkpage(): Page {
			return new bot.page('User talk:' + this.username);
		}

		// XXX: should these yield rather than return?

		/**
		 * Get user's recent contributions
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>}
		 */
		contribs(options): Promise<any[]> {
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
		logs(options): Promise<any[]> {
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
		info(props): Promise<any> {
			return bot.request({
				action: 'query',
				list: 'users',
				ususers: this.username,
				usprop: props || 'editcount|registration|blockinfo|emailable|gender|' +
					'rights|groups|groupmemberships|implicitgroups'
			}).then(data => data.query.users[0]);
		}

		/**
		 * Get global user info for wikis with CentralAuth
		 * @param {("groups"|"rights"|"merged"|"unattached"|"editcount")[]} props
		 */
		globalinfo(props): Promise<any> {
			return bot.request({
				"action": "query",
				"meta": "globaluserinfo",
				"guiuser": this.username,
				"guiprop": props || ''
			}).then(data => {
				return data.query.globaluserinfo;
			});
		}

		/**
		 * Post a message on user's talk page
		 * @param {string} header
		 * @param {string} message
		 * @returns {Promise}
		 */
		sendMessage(header: string, message: string) {
			return this.talkpage.newSection(header, message);
		}


		/**
		 * Send the user an email
		 */
		email(subject: string, message: string): Promise<any> {
			return bot.request({
				action: 'emailuser',
				target: this.username,
				subject: subject,
				text: message,
				token: bot.csrfToken
			}).then(data => data.emailuser);
		}

		/**
		 * Block the user
		 * @param {Object} options - additional API options
		 */
		block(options): Promise<any> {
			return bot.request(Object.assign({
				action: 'block',
				user: this.username,
				token: bot.csrfToken
			}, options)).then(data => data.block);
		}

		/**
		 * Unblock the user
		 * @param {Object} options - additional API options
		 */
		unblock(options): Promise<any> {
			return bot.request(Object.assign({
				action: 'unblock',
				user: this.username,
				token: bot.csrfToken
			}, options)).then(data => data.unblock);
		}

	}

	return User;

};
