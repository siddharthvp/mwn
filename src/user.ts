import type { mwn, MwnPage } from './bot';
import type {
	ApiBlockParams,
	ApiEmailUserParams,
	ApiQueryGlobalUserInfoParams,
	ApiQueryLogEventsParams,
	ApiQueryUserContribsParams,
	ApiQueryUsersParams,
	ApiUnblockParams,
} from './api_params';
import { rejectWithError } from './error';
import {
	ApiBlockResponse,
	ApiEditResponse,
	ApiEmailUserResponse,
	ApiQueryGlobalUserInfoResponse,
	ApiQueryUsersResponse,
	ApiUnblockResponse,
	LogEvent,
	UserContribution,
} from './api_response_types';

export interface MwnUserStatic {
	new (username: string): MwnUser;
}

export interface MwnUser {
	username: string;
	userpage: MwnPage;
	talkpage: MwnPage;
	/**
	 * Get user's recent contributions
	 * @param {Object} options - additional API options
	 * @returns {Promise<Object[]>}
	 */
	contribs(options?: ApiQueryUserContribsParams): Promise<UserContribution[]>;
	contribsGen(options?: ApiQueryUserContribsParams): AsyncGenerator<UserContribution>;
	/**
	 * Get user's recent log actions
	 * @param {Object} options - additional API options
	 * @returns {Promise<Object[]>}
	 */
	logs(options?: ApiQueryLogEventsParams): Promise<LogEvent[]>;
	logsGen(options?: ApiQueryLogEventsParams): AsyncGenerator<LogEvent>;
	/**
	 * Get public information about the user
	 * @param {string|string[]} props - properties to fetch
	 * @returns {Promise<Object>}
	 */
	info(props?: ApiQueryUsersParams['usprop']): Promise<ApiQueryUsersResponse>;
	/**
	 * Get global user info for wikis with CentralAuth
	 * @param {string|string[]} props
	 */
	globalinfo(props?: ApiQueryGlobalUserInfoParams['guiprop']): Promise<ApiQueryGlobalUserInfoResponse>;
	/**
	 * Post a message on user's talk page
	 * @param {string} header
	 * @param {string} message
	 * @returns {Promise}
	 */
	sendMessage(header: string, message: string): Promise<ApiEditResponse>;
	/**
	 * Send the user an email
	 */
	email(subject: string, message: string, options?: ApiEmailUserParams): Promise<ApiEmailUserResponse>;
	/**
	 * Block the user
	 * @param {Object} options - additional API options
	 */
	block(options: ApiBlockParams): Promise<ApiBlockResponse>;
	/**
	 * Unblock the user
	 * @param {Object} options - additional API options
	 */
	unblock(options: ApiUnblockParams): Promise<ApiUnblockResponse>;
}

export default function (bot: mwn) {
	class User implements MwnUser {
		username: string;

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
			return new bot.Page('User:' + this.username);
		}

		get talkpage(): MwnPage {
			return new bot.Page('User talk:' + this.username);
		}

		// XXX: should these yield rather than return?

		/** @inheritDoc */
		contribs(options?: ApiQueryUserContribsParams): Promise<UserContribution[]> {
			return bot
				.request({
					action: 'query',
					list: 'usercontribs',
					ucuser: this.username,
					uclimit: 'max',
					...options,
				})
				.then((data) => data.query.usercontribs);
		}

		async *contribsGen(options?: ApiQueryUserContribsParams): AsyncGenerator<UserContribution> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'usercontribs',
				ucuser: this.username,
				uclimit: 'max',
				...options,
			});
			for await (let json of continuedQuery) {
				for (let edit of json.query.usercontribs) {
					yield edit;
				}
			}
		}

		/** @inheritDoc */
		logs(options?: ApiQueryLogEventsParams): Promise<LogEvent[]> {
			return bot
				.request({
					action: 'query',
					list: 'logevents',
					leuser: this.username,
					lelimit: 'max',
					...options,
				})
				.then((data) => data.query.logevents);
		}

		async *logsGen(options?: ApiQueryLogEventsParams): AsyncGenerator<LogEvent> {
			let continuedQuery = bot.continuedQueryGen({
				action: 'query',
				list: 'logevents',
				leuser: this.username,
				lelimit: 'max',
				...options,
			});
			for await (let json of continuedQuery) {
				for (let action of json.query.logevents) {
					yield action;
				}
			}
		}

		/** @inheritDoc */
		info(props?: ApiQueryUsersParams['usprop']): Promise<any> {
			return bot
				.request({
					action: 'query',
					list: 'users',
					ususers: this.username,
					usprop:
						props ||
						'editcount|registration|blockinfo|emailable|gender|' +
							'rights|groups|groupmemberships|implicitgroups',
				})
				.then((data) => data.query.users[0]);
		}

		/** @inheritDoc */
		globalinfo(props?: ApiQueryGlobalUserInfoParams['guiprop']): Promise<ApiQueryGlobalUserInfoResponse> {
			return bot
				.request({
					action: 'query',
					meta: 'globaluserinfo',
					guiuser: this.username,
					guiprop: props || '',
				})
				.then((data) => {
					return data.query.globaluserinfo;
				});
		}

		/** @inheritDoc */
		sendMessage(header: string, message: string): Promise<ApiEditResponse> {
			return this.talkpage.newSection(header, message);
		}

		/** @inheritDoc */
		email(subject: string, message: string, options?: ApiEmailUserParams): Promise<ApiEmailUserResponse> {
			return bot
				.request({
					action: 'emailuser',
					target: this.username,
					subject: subject,
					text: message,
					token: bot.csrfToken,
					...options,
				})
				.then((response) => {
					let data = response.emailuser;
					if (data.result === 'Success') {
						return data;
					} else {
						return rejectWithError({
							// try to get an error code and info
							code: data.errors?.[0]?.code,
							info: data.errors?.[0]?.info,
							...data,
						});
					}
				});
		}

		/** @inheritDoc */
		block(options: ApiBlockParams): Promise<ApiBlockResponse> {
			return bot
				.request({
					action: 'block',
					user: this.username,
					token: bot.csrfToken,
					...options,
				})
				.then((data) => data.block);
		}

		/** @inheritDoc */
		unblock(options: ApiUnblockParams): Promise<ApiUnblockResponse> {
			return bot
				.request({
					action: 'unblock',
					user: this.username,
					token: bot.csrfToken,
					...options,
				})
				.then((data) => data.unblock);
		}
	}

	return User as MwnUserStatic;
}
