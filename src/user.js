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
		// TODO: allow custom params

		contribs() {
			return bot.request({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max'
			}).then(data => data.query.usercontribs);
		}

		logs() {
			return bot.request({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max'
			}).then(data => data.query.logevents);
		}

	}

	return User;

};