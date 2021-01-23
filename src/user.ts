import type {mwn, MwnPage} from "./bot";
import type {
	ApiBlockParams,
	ApiEmailUserParams,
	ApiQueryLogEventsParams,
	ApiQueryUserContribsParams,
	ApiUnblockParams
} from "./api_params";


export interface MwnUserStatic {
	new (username: string): MwnUser;
}

export interface MwnUser {
	username: string;
	userpage: MwnPage;
	talkpage: MwnPage;
	contribs(options?: ApiQueryUserContribsParams): Promise<UserContribution[]>;
	contribsGen(options?: ApiQueryUserContribsParams): AsyncGenerator<UserContribution>;
	logs(options?: ApiQueryLogEventsParams): Promise<LogEvent[]>;
	logsGen(options?: ApiQueryLogEventsParams): AsyncGenerator<LogEvent>;
	info(props?: string | string[]): Promise<any>;
	globalinfo(props?: ("groups" | "rights" | "merged" | "unattached" | "editcount")[]): Promise<any>;
	sendMessage(header: string, message: string): Promise<any>;
	email(subject: string, message: string, options?: ApiEmailUserParams): Promise<any>;
	block(options: ApiBlockParams): Promise<any>;
	unblock(options: ApiUnblockParams): Promise<any>;
}

export type UserContribution = {
	userid: number
	user: string
	pageid: number
	revid: number
	parentid: number
	ns: number
	title: string
	timestamp: string
	new: boolean
	minor: boolean
	top: boolean
	comment: string
	size: number
}

export type LogEvent = {
	logid: number
	ns: number
	title: string
	pageid: number
	logpage: number
	params: any
	type: string
	action: string
	user: string
	timestamp: string
	comment: string
}

export default function(bot: mwn) {

	class User implements MwnUser {
		username: string

		/**
		 * @constructor
		 * @param {string} name - username
		 */
		constructor(name: string) {
			this.username = name;
		}

		get userpage(): MwnPage {
			// User: namespace name will work across all MW sites
			// as it is a canonical namespace name
			return new bot.page('User:' + this.username);
		}

		get talkpage(): MwnPage {
			return new bot.page('User talk:' + this.username);
		}

		// XXX: should these yield rather than return?

		/**
		 * Get user's recent contributions
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>}
		 */
		contribs(options?: ApiQueryUserContribsParams): Promise<UserContribution[]> {
			return bot.request({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max',
				...options
			}).then(data => data.query.usercontribs);
		}

		async *contribsGen(options?: ApiQueryUserContribsParams): AsyncGenerator<UserContribution> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max',
				...options
			});
			for await (let json of continuedQuery) {
				for (let edit of json.query.usercontribs) {
					yield edit;
				}
			}
		}

		/**
		 * Get user's recent log actions
		 * @param {Object} options - additional API options
		 * @returns {Promise<Object[]>}
		 */
		logs(options?: ApiQueryLogEventsParams): Promise<LogEvent[]> {
			return bot.request({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max',
				...options
			}).then(data => data.query.logevents);
		}

		async *logsGen(options?: ApiQueryLogEventsParams): AsyncGenerator<LogEvent> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max',
				...options
			});
			for await (let json of continuedQuery) {
				for (let action of json.query.logevents) {
					yield action;
				}
			}
		}

		/**
		 * Get public information about the user
		 * @param {Array} props - properties to fetch
		 * @returns {Promise<Object>}
		 */
		info(props?: string | string[]): Promise<any> {
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
		globalinfo(props?: ("groups"|"rights"|"merged"|"unattached"|"editcount")[]): Promise<any> {
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
		email(subject: string, message: string, options?: ApiEmailUserParams): Promise<any> {
			return bot.request({
				action: 'emailuser',
				target: this.username,
				subject: subject,
				text: message,
				token: bot.csrfToken,
				...options
			}).then(data => data.emailuser);
		}

		/**
		 * Block the user
		 * @param {Object} options - additional API options
		 */
		block(options: ApiBlockParams): Promise<any> {
			return bot.request({
				action: 'block',
				user: this.username,
				token: bot.csrfToken,
				...options
			}).then(data => data.block);
		}

		/**
		 * Unblock the user
		 * @param {Object} options - additional API options
		 */
		unblock(options: ApiUnblockParams): Promise<any> {
			return bot.request({
				action: 'unblock',
				user: this.username,
				token: bot.csrfToken,
				...options
			}).then(data => data.unblock);
		}

	}

	return User as MwnUserStatic;

}
