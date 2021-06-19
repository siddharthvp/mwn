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
	nochange?: boolean;
	oldrevid: number;
	newrevid: number;
	newtimestamp: string;
};

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

// If rvslots is not used revisions slot info is part of revision object
export interface ApiPage {
	pageid: number;
	ns: number;
	title: string;
	missing?: true;
	invalid?: true;
	revisions?: ApiRevision[];
}

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
