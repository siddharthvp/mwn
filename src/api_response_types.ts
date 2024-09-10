export interface ApiResponse {
	query?: Record<string, any>;
	[prop: string]: any;
}

export interface ApiResponseSubType {
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

export interface ApiQueryResponse {
	batchcomplete?: true;
	continue?: {
		continue: string;
		[prop: string]: string;
	};
	query: {
		pages?: Array<ApiPage>;
		allpages?: ApiPageList;
		backlinks?: ApiPageList;
		allcategories?: Array<{ category: string }>;
		allimages?: Array<{
			name: string;
			timestamp: string;
			url: string;
			descriptionurl: string;
			descriptionshorturl: string;
			ns: number;
			title: string;
		}>;

		alllinks?: ApiLinkList;
		alltransclusions?: ApiLinkList;
		allfileusages?: ApiLinkList;
		allredirects?: ApiLinkList;

		categorymembers: any; // TODO

		[prop: string]: any;
	};
}

export type ApiLinkList = Array<{
	ns?: number;
	title?: string;
	fromid?: number;
}>;
export type ApiPageList = Array<{
	pageid: number;
	ns: number;
	title: string;
}>;

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

export type RecentChange = {
	type: string;
	ns: number;
	title: string;
	pageid: number;
	revid: number;
	old_revid: number;
	rcid: number;
	timestamp: string;
	user?: string;
	userid?: number;
	bot?: boolean;
	new?: boolean;
	minor?: boolean;
	oldlen?: number;
	newlen?: number;
	comment?: string;
	parsedcomment?: string;
	redirect?: boolean;
	tags?: string[];
	sha1?: string;
	oresscores?: Record<string, any>;
};

export interface ApiPage {
	pageid: number;
	ns: number;
	title: string;
	missing?: true;
	invalid?: true;
	revisions?: Array<ApiRevision>;
	categories?: Array<LinkTarget>;
	templates?: Array<LinkTarget>;
	links?: Array<LinkTarget>;
	images?: Array<LinkTarget>;
	linkshere?: Array<ReverseLinkTarget>;
	transcludedin?: Array<ReverseLinkTarget>;
	fileusage?: Array<ReverseLinkTarget>;
	extlinks?: Array<{ url: string }>;
	iwlinks?: Array<{ prefix: string; title: string }>;
	langlinks?: Array<{ lang: string; title: string }>;
	langlinkscount?: number;

	imagerepository?: string;
	badfile?: boolean;
	imageinfo?: Array<ImageInfo>;

	categoryinfo?: {
		size: number;
		pages: number;
		files: number;
		subcats: number;
		hidden: boolean;
	};

	[prop: string]: any;
}

export type LinkTarget = {
	ns: number;
	title: string;
};
export type ReverseLinkTarget = {
	pageid: number;
	ns: number;
	title: string;
	redirect: boolean;
};

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

export type ImageInfo = {
	timestamp?: string;
	userid?: number;
	user?: string;
	size?: number;
	width?: number;
	height?: number;
	parsedcomment?: string;
	comment?: string;
	html?: string;
	canonicaltitle?: string;
	url?: string;
	descriptionurl?: string;
	descriptionshorturl?: string;
	sha1?: string;
	metadata?: Array<{ name: string; value: any }>;
	extmetadata?: any;
	mime?: string;
	mediatype?: string;
	bitdepth?: number;
};
