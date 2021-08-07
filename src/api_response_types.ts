export interface ApiResponse {
	query?: Record<string, any>;
	[prop: string]: any;
}

export type ApiEditResponse = {
	// fix
	result: string;
	pageid: number;
	title: string;
	contentmodel: string;
	nochange?: true;
	oldrevid: number;
	newrevid: number;
	newtimestamp: string;
};

// TODO: make these more specific
export type ApiMoveResponse = ApiResponse;

export type ApiDeleteResponse = ApiResponse;

export type ApiUndeleteResponse = ApiResponse;

export type ApiProtectResponse = ApiResponse;

export type ApiUploadResponse = ApiResponse;

export type ApiRollbackResponse = ApiResponse;

export type ApiBlockResponse = ApiResponse;

export type ApiUnblockResponse = ApiResponse;

export type ApiEmailUserResponse = ApiResponse;

export type ApiQueryUsersResponse = ApiResponse;

export type ApiQueryGlobalUserInfoResponse = ApiResponse;

export interface ApiParseResponse {
	title: string;
	pageid: number;
	revid: number;
	text: string;
	langlinks: Array<{
		lang: string; // language code
		url: string;
		langname: string;
		autonym: string;
		title: string;
	}>;
	categories: Array<{
		sortkey: string;
		category: string;
		hidden?: true;
	}>;
	links: Array<{
		ns: number;
		title: string;
		exists: boolean;
	}>;
	templates: Array<{
		ns: number;
		title: string;
		exists: boolean;
	}>;
	images: string[];
	externallinks: string[];
	sections: Array<{
		toclevel: number;
		level: string; // int
		line: string;
		number: string; // int
		index: string; // int
		fromtitle: string;
		byteoffset: number;
		anchor: string;
	}>;
	parsewarnings: Array<any>;
	displaytitle: string;
	iwlinks: Array<{
		prefix: string;
		url: string;
		title: string;
	}>;
	properties: {
		notoc: '';
		noindex: '';
		[name: string]: string;
	};
}

export type ApiSearchResult = {
	ns: number;
	title: string;
	pageid: number;
	size: number;
	wordcount: number;
	snippet: string;
	timestamp: string;
	isfilematch: boolean;
	titlesnippet: string;
	categorysnippet: string;
	sectionsnippet?: string;
	redirecttitle?: string;
	redirectsnippet?: string;
};

export type UserContribution = {
	userid: number;
	user: string;
	pageid: number;
	revid: number;
	parentid: number;
	ns: number;
	title: string;
	timestamp: string;
	new: boolean;
	minor: boolean;
	top: boolean;
	comment: string;
	size: number;
};

export type LogEvent = {
	logid: number;
	ns: number;
	title: string;
	pageid: number;
	logpage: number;
	params: any;
	type: string;
	action: string;
	user: string;
	timestamp: string;
	comment: string;
};

export interface ApiPage {
	pageid: number;
	ns: number;
	title: string;
	missing?: true;
	invalid?: true;
	revisions?: ApiRevision[];
}

// If rvslots is not used revisions slot info is part of revision object
export interface ApiRevision extends ApiRevisionSlot {
	revid?: number;
	parentid?: number;
	minor?: boolean;
	userhidden?: true;
	anon?: true;
	user?: string;
	userid?: number;
	timestamp?: string;
	roles?: string[];
	commenthidden?: true;
	comment?: string;
	parsedcomment?: string;
	slots?: {
		main: ApiRevisionSlot;
		[slotname: string]: ApiRevisionSlot;
	};
}

export interface ApiRevisionSlot {
	size?: number;
	sha1?: string;
	contentmodel?: string;
	contentformat?: string;
	content?: string;
}
