module.exports = function(bot) {

	class User {

		constructor(name) {
			this.username = name;
		}

		get userpage() {
			return new bot.page('User:' + this.username);
		}

		get talkpage() {
			return new bot.page('User talk:' + this.username);
		}

		// XXX: should these yield rather than return?

		contribs(options) {
			return bot.request(Object.assign({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max'
			}, options)).then(data => data.query.usercontribs);
		}

		logs(options) {
			return bot.request(Object.assign({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max'
			}, options)).then(data => data.query.logevents);
		}

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
		 * @param {string} header
		 * @param {string} message
		 */
		sendMessage(header, message) {
			return this.talkpage.newSection(header, message);
		}

		email(subject, message) {
			return this.request({
				action: 'emailuser',
				target: this.username,
				subject: subject,
				text: message,
				token: bot.csrfToken
			}).then(data => data.emailuser);
		}

		block(options) {
			return bot.request(Object.assign({
				action: 'block',
				user: this.username,
			}, options)).then(data => data.block);
		}

		unblock(options) {
			return bot.request(Object.assign({
				action: 'unblock',
				user: this.username
			},options)).then(data => data.unblock);
		}

	}

	return User;

};