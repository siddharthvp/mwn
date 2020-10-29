type timestamp = string
type namespace = number
type limit = number
type password = string
type upload = any // Ahem

export interface ApiParams {
	action: string
	format: 'json' | 'jsonfm' | 'xml' | 'xmlfm' | 'php' | 'none'
	formatversion: '1' | '2' | 'latest'
	maxlag: number
	smaxage: number
	maxage: number
	assert: 'user' | 'bot' | 'anon'
	assertuser: string
	requestId: any
	servedby: boolean
	curtimestamp: boolean
	responselanginfo: boolean
	origin: string
	uselang: string
	errorformat: 'bc' | 'html' | 'none' | 'plaintext' | 'raw' | 'wikitext'
	errorlang: string
	errorsuselocal: boolean
	centralauthtoken: string
}


// AUTOMATICALLY GENERATED FROM HERE:

export interface ApiAbuseFilterCheckMatchParams extends ApiParams {
	filter: string
	vars: string
	rcid: number
	logid: number
}

export interface ApiAbuseFilterCheckSyntaxParams extends ApiParams {
	filter: string
}

export interface ApiAbuseFilterEvalExpressionParams extends ApiParams {
	expression: string
	prettyprint: boolean
}

export interface ApiAbuseFilterUnblockAutopromoteParams extends ApiParams {
	user: string
	token: string
}

export interface ApiAbuseLogPrivateDetailsParams extends ApiParams {
	logid: number
	reason: string
	token: string
}

export interface ApiAntiSpoofParams extends ApiParams {
	username: string
}

export interface ApiBlockParams extends ApiParams {
	user: string
	userid: number
	expiry: string
	reason: string
	anononly: boolean
	nocreate: boolean
	autoblock: boolean
	noemail: boolean
	hidename: boolean
	allowusertalk: boolean
	reblock: boolean
	watchuser: boolean
	tags: string | string[]
	partial: boolean
	pagerestrictions: string | string[]
	namespacerestrictions: namespace | namespace[]
	token: string
}

export interface ApiBounceHandlerParams extends ApiParams {
	email: string
}

export interface ApiCategoryTreeParams extends ApiParams {
	category: string
	options: string
}

export interface ApiCentralAuthTokenParams extends ApiParams {

}

export interface ApiCentralNoticeCdnCacheUpdateBannerParams extends ApiParams {
	banner: string
	language: string
	token: string
}

export interface ApiCentralNoticeChoiceDataParams extends ApiParams {
	project: string
	language: string
}

export interface ApiCentralNoticeQueryCampaignParams extends ApiParams {
	campaign: string
}

export interface ApiChangeAuthenticationDataParams extends ApiParams {
	request: string
	token: string
}

export interface ApiChangeContentModelParams extends ApiParams {
	title: string
	pageid: number
	summary: string
	tags: string | string[]
	model: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'wikitext'
	bot: boolean
	token: string
}

export interface ApiCheckTokenParams extends ApiParams {
	type: 'createaccount' | 'csrf' | 'deleteglobalaccount' | 'login' | 'patrol' | 'rollback' | 'setglobalaccountstatus' | 'userrights' | 'watch'
	token: string
	maxtokenage: number
}

export interface CirrusSearchApiConfigDumpParams extends ApiParams {

}

export interface CirrusSearchApiMappingDumpParams extends ApiParams {

}

export interface CirrusSearchApiProfilesDumpParams extends ApiParams {
	verbose: boolean
}

export interface CirrusSearchApiSettingsDumpParams extends ApiParams {

}

export interface ApiClearHasMsgParams extends ApiParams {

}

export interface ApiClientLoginParams extends ApiParams {
	requests: string | string[]
	messageformat: 'html' | 'none' | 'raw' | 'wikitext'
	mergerequestfields: boolean
	preservestate: boolean
	returnurl: string
	continue: boolean
	token: string
}

export interface ApiComparePagesParams extends ApiParams {
	fromtitle: string
	fromid: number
	fromrev: number
	fromslots: ('main')[]
	frompst: boolean
	fromtext: string
	fromcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	fromcontentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	fromsection: string
	totitle: string
	toid: number
	torev: number
	torelative: 'cur' | 'next' | 'prev'
	toslots: ('main')[]
	topst: boolean
	totext: string
	tocontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	tocontentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	tosection: string
	prop: ('comment' | 'diff' | 'diffsize' | 'ids' | 'parsedcomment' | 'rel' | 'size' | 'timestamp' | 'title' | 'user')[]
	slots: ('main')[]
}

export interface ApiAMCreateAccountParams extends ApiParams {
	requests: string | string[]
	messageformat: 'html' | 'none' | 'raw' | 'wikitext'
	mergerequestfields: boolean
	preservestate: boolean
	returnurl: string
	continue: boolean
	token: string
}

export interface ApiCSPReportParams extends ApiParams {
	reportonly: boolean
	source: string
}

export interface ApiContentTranslationConfigurationParams extends ApiParams {
	from: string
	to: string
}

export interface ApiContentTranslationDeleteParams extends ApiParams {
	from: string
	to: string
	sourcetitle: string
	token: string
}

export interface ApiContentTranslationPublishParams extends ApiParams {
	title: string
	html: string
	from: string
	to: string
	sourcetitle: string
	categories: string
	publishtags: string | string[]
	wpCaptchaId: string
	wpCaptchaWord: string
	cxversion: number
	token: string
}

export interface ApiContentTranslationSaveParams extends ApiParams {
	from: string
	to: string
	sourcetitle: string
	title: string
	content: string
	sourcerevision: number
	progress: string
	cxversion: number
	sourcecategories: string
	targetcategories: string
	token: string
}

export interface ApiContentTranslationSuggestionListParams extends ApiParams {
	listname: string
	listaction: 'add' | 'remove' | 'view'
	titles: string | string[]
	from: string
	to: string
	token: string
}

export interface ApiContentTranslationTokenParams extends ApiParams {
	token: string
}

export interface ApiDeleteParams extends ApiParams {
	title: string
	pageid: number
	reason: string
	tags: string | string[]
	watch: boolean
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	unwatch: boolean
	oldimage: string
	token: string
}

export interface ApiDeleteGlobalAccountParams extends ApiParams {
	user: string
	reason: string
	token: string
}

export interface MediaWikiExtensionDiscussionToolsApiDiscussionToolsParams extends ApiParams {
	paction: 'transcludedfrom'
	page: string
	oldid: string
}

export interface MediaWikiExtensionDiscussionToolsApiDiscussionToolsEditParams extends ApiParams {
	paction: 'addcomment' | 'addtopic'
	page: string
	token: string
	commentid: string
	wikitext: string
	html: string
	summary: string
	sectiontitle: string
	watchlist: string
	captchaid: string
	captchaword: string
}

export interface ApiEchoMarkReadParams extends ApiParams {
	wikis: string | string[]
	list: string | string[]
	unreadlist: string | string[]
	all: boolean
	sections: ('alert' | 'message')[]
	token: string
}

export interface ApiEchoMarkSeenParams extends ApiParams {
	type: 'alert' | 'all' | 'message'
	timestampFormat: 'ISO_8601' | 'MW'
}

export interface ApiEchoMuteParams extends ApiParams {
	type: 'page-linked-title' | 'user'
	mute: string | string[]
	unmute: string | string[]
	token: string
}

export interface EchoPushApiApiEchoPushSubscriptionsParams extends ApiParams {
	command: 'create' | 'delete'
	token: string
}

export interface ApiEditPageParams extends ApiParams {
	title: string
	pageid: number
	section: string
	sectiontitle: string
	text: string
	summary: string
	tags: string | string[]
	minor: boolean
	notminor: boolean
	bot: boolean
	baserevid: number
	basetimestamp: timestamp
	starttimestamp: timestamp
	recreate: boolean
	createonly: boolean
	nocreate: boolean
	watch: boolean
	unwatch: boolean
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	md5: string
	prependtext: string
	appendtext: string
	undo: number
	undoafter: number
	redirect: boolean
	contentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	contentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	token: string
	captchaword: string
	captchaid: string
}

export interface MediaWikiMassMessageApiApiEditMassMessageListParams extends ApiParams {
	spamlist: string
	description: string
	add: string | string[]
	remove: string | string[]
	token: string
}

export interface ApiEmailUserParams extends ApiParams {
	target: string
	subject: string
	text: string
	ccme: boolean
	token: string
}

export interface ApiExpandTemplatesParams extends ApiParams {
	title: string
	text: string
	revid: number
	prop: ('categories' | 'encodedjsconfigvars' | 'jsconfigvars' | 'modules' | 'parsetree' | 'properties' | 'ttl' | 'volatile' | 'wikitext')[]
	includecomments: boolean
	generatexml: boolean
	templatesandboxprefix: string | string[]
	templatesandboxtitle: string
	templatesandboxtext: string
	templatesandboxcontentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	templatesandboxcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
}

export interface ApiFancyCaptchaReloadParams extends ApiParams {

}

export interface ApiFeaturedFeedsParams extends ApiParams {
	feedformat: 'atom' | 'rss'
	feed: 'featured' | 'onthisday' | 'potd'
	language: string
}

export interface ApiFeedContributionsParams extends ApiParams {
	feedformat: 'atom' | 'rss'
	user: string
	namespace: namespace
	year: number
	month: number
	tagfilter: ('AWB' | 'Citing predatory open access journal' | 'End of page text' | 'External Link added to disambiguation page' | 'Extraneous formatting' | 'Image up for deletion on Commons' | 'Manual revert' | 'OAuth CID: 21' | 'OAuth CID: 60' | 'OAuth CID: 64' | 'OAuth CID: 67' | 'OAuth CID: 76' | 'OAuth CID: 85' | 'OAuth CID: 99' | 'OAuth CID: 115' | 'OAuth CID: 142' | 'OAuth CID: 144' | 'OAuth CID: 150' | 'OAuth CID: 151' | 'OAuth CID: 154' | 'OAuth CID: 159' | 'OAuth CID: 194' | 'OAuth CID: 206' | 'OAuth CID: 211' | 'OAuth CID: 212' | 'OAuth CID: 218' | 'OAuth CID: 236' | 'OAuth CID: 239' | 'OAuth CID: 251' | 'OAuth CID: 252' | 'OAuth CID: 259' | 'OAuth CID: 261' | 'OAuth CID: 263' | 'OAuth CID: 274' | 'OAuth CID: 278' | 'OAuth CID: 285' | 'OAuth CID: 297' | 'OAuth CID: 306' | 'OAuth CID: 314' | 'OAuth CID: 320' | 'OAuth CID: 376' | 'OAuth CID: 410' | 'OAuth CID: 429' | 'OAuth CID: 473' | 'OAuth CID: 540' | 'OAuth CID: 542' | 'OAuth CID: 543' | 'OAuth CID: 563' | 'OAuth CID: 593' | 'OAuth CID: 612' | 'OAuth CID: 628' | 'OAuth CID: 651' | 'OAuth CID: 670' | 'OAuth CID: 678' | 'OAuth CID: 679' | 'OAuth CID: 817' | 'OAuth CID: 860' | 'OAuth CID: 861' | 'OAuth CID: 874' | 'OAuth CID: 951' | 'OAuth CID: 1003' | 'OAuth CID: 1013' | 'OAuth CID: 1015' | 'OAuth CID: 1024' | 'OAuth CID: 1188' | 'OAuth CID: 1224' | 'OAuth CID: 1232' | 'OAuth CID: 1261' | 'OAuth CID: 1277' | 'OAuth CID: 1352' | 'OAuth CID: 1359' | 'OAuth CID: 1365' | 'OAuth CID: 1389' | 'OAuth CID: 1413' | 'OAuth CID: 1436' | 'OAuth CID: 1452' | 'OAuth CID: 1503' | 'OAuth CID: 1566' | 'OAuth CID: 1703' | 'OAuth CID: 1745' | 'OAuth CID: 1779' | 'OAuth CID: 1784' | 'OAuth CID: 1804' | 'OAuth CID: 1805' | 'OAuth CID: 1809' | 'OAuth CID: 1841' | 'OAuth CID: 1887' | 'OAuth CID: 1904' | 'OAuth CID: 2008' | 'Page creator removing CSD tag' | 'Possible disruption' | 'Possible self promotion in user or draftspace' | 'Possible self promotion in userspace' | 'Possible vandalism' | 'ProveIt edit' | 'Rapid reverts' | 'RedWarn' | 'STiki' | 'Section blanking' | 'WPCleaner' | 'WikiLoop Battlefield' | 'abusefilter-condition-limit' | 'adding email address' | 'advanced mobile edit' | 'android app edit' | 'autobiography' | 'bad external' | 'blanking' | 'bot trial' | 'campaign-external-machine-translation' | 'canned edit summary' | 'categories removed' | 'centralnotice' | 'centralnotice translation' | 'changing height or weight' | 'coi-spam' | 'congressedits' | 'contenttranslation' | 'contenttranslation-needcheck' | 'contenttranslation-v2' | 'de-userfying' | 'deprecated source' | 'disambiguation template removed' | 'discretionary' | 'discretionary sanctions alert' | 'discussiontools' | 'discussiontools-edit' | 'discussiontools-newtopic' | 'discussiontools-reply' | 'discussiontools-source' | 'discussiontools-visual' | 'editProtectedHelper' | 'extraneous markup' | 'huggle' | 'image template removal' | 'ios app edit' | 'large non-free file' | 'large plot addition' | 'large unwikified new article' | 'massmessage-delivery' | 'missing file added' | 'mobile app edit' | 'mobile edit' | 'mobile web edit' | 'mw-blank' | 'mw-changed-redirect-target' | 'mw-contentmodelchange' | 'mw-manual-revert' | 'mw-new-redirect' | 'mw-removed-redirect' | 'mw-replace' | 'mw-reverted' | 'mw-rollback' | 'mw-undo' | 'new user modifying archives' | 'non-English content' | 'nowiki added' | 'pagetriage' | 'possible birth date change' | 'possible cut and paste move' | 'possible libel or vandalism' | 'possible link spam' | 'possible unreferenced addition to BLP' | 'possible vandalism' | 'posted screed' | 'predatory' | 'reference list removal' | 'references removed' | 'removal of COI template' | 'removal of Category:Living People' | 'removal of articles for deletion template' | 'removal of copyvio templates' | 'removal of speedy deletion templates' | 'reverting anti-vandal bot' | 'self-published-blog' | 'self-published source' | 'self-renaming and bad user talk moves' | 'shouting' | 'talk page blanking' | 'twinkle' | 'unsourced AFC submission' | 'unusual redirect' | 'userspace spam' | 'very short new article' | 'visualeditor' | 'visualeditor-needcheck' | 'visualeditor-switched' | 'visualeditor-wikitext' | 'wikilinks removed' | 'wikilove')[]
	deletedonly: boolean
	toponly: boolean
	newonly: boolean
	hideminor: boolean
	showsizediff: boolean
}

export interface ApiFeedRecentChangesParams extends ApiParams {
	feedformat: 'atom' | 'rss'
	namespace: namespace
	invert: boolean
	associated: boolean
	days: number
	limit: number
	from: timestamp
	hideminor: boolean
	hidebots: boolean
	hideanons: boolean
	hideliu: boolean
	hidepatrolled: boolean
	hidemyself: boolean
	hidecategorization: boolean
	tagfilter: string
	target: string
	showlinkedto: boolean
}

export interface ApiFeedWatchlistParams extends ApiParams {
	feedformat: 'atom' | 'rss'
	hours: number
	linktosections: boolean
	allrev: boolean
	wlowner: string
	wltoken: string
	wlshow: ('!anon' | '!autopatrolled' | '!bot' | '!minor' | '!patrolled' | '!unread' | 'anon' | 'autopatrolled' | 'bot' | 'minor' | 'patrolled' | 'unread')[]
	wltype: ('categorize' | 'edit' | 'external' | 'log' | 'new')[]
	wlexcludeuser: string
}

export interface ApiFileRevertParams extends ApiParams {
	filename: string
	comment: string
	archivename: string
	token: string
}

export interface ApiFlagConfigParams extends ApiParams {

}

export interface ApiGlobalBlockParams extends ApiParams {
	target: string
	expiry: string
	unblock: boolean
	reason: string
	anononly: boolean
	modify: boolean
	alsolocal: boolean
	localblockstalk: boolean
	token: string
}

export interface GlobalPreferencesApiGlobalPreferenceOverridesParams extends ApiParams {
	reset: boolean
	resetkinds: ('all' | 'registered' | 'registered-checkmatrix' | 'registered-multiselect' | 'special' | 'unused' | 'userjs')[]
	change: string | string[]
	optionname: string
	optionvalue: string
	token: string
}

export interface GlobalPreferencesApiGlobalPreferencesParams extends ApiParams {
	reset: boolean
	resetkinds: ('all' | 'registered' | 'registered-checkmatrix' | 'registered-multiselect' | 'special' | 'unused' | 'userjs')[]
	change: string | string[]
	optionname: string
	optionvalue: string
	token: string
}

export interface ApiGlobalUserRightsParams extends ApiParams {
	user: string
	userid: number
	add: ('abusefilter-helper' | 'abusefilter-maintainer' | 'apihighlimits-requestor' | 'captcha-exempt' | 'founder' | 'global-bot' | 'global-deleter' | 'global-flow-create' | 'global-interface-editor' | 'global-ipblock-exempt' | 'global-rollbacker' | 'global-sysop' | 'new-wikis-importer' | 'oathauth-tester' | 'ombuds' | 'otrs-member' | 'recursive-export' | 'staff' | 'steward' | 'sysadmin' | 'wmf-ops-monitoring' | 'wmf-researcher')[]
	remove: ('abusefilter-helper' | 'abusefilter-maintainer' | 'apihighlimits-requestor' | 'captcha-exempt' | 'founder' | 'global-bot' | 'global-deleter' | 'global-flow-create' | 'global-interface-editor' | 'global-ipblock-exempt' | 'global-rollbacker' | 'global-sysop' | 'new-wikis-importer' | 'oathauth-tester' | 'ombuds' | 'otrs-member' | 'recursive-export' | 'staff' | 'steward' | 'sysadmin' | 'wmf-ops-monitoring' | 'wmf-researcher')[]
	reason: string
	token: string
	tags: string | string[]
}

export interface GraphApiGraphParams extends ApiParams {
	hash: string
	title: string
	text: string
	oldid: number
}

export interface ApiHelpParams extends ApiParams {
	modules: string | string[]
	submodules: boolean
	recursivesubmodules: boolean
	wrap: boolean
	toc: boolean
}

export interface ApiDisabledParams extends ApiParams {

}

export interface ApiImportParams extends ApiParams {
	summary: string
	xml: upload
	interwikiprefix: string
	interwikisource: 'commons' | 'de' | 'es' | 'fr' | 'it' | 'meta' | 'nost' | 'outreachwiki' | 'pl' | 'test2wiki'
	interwikipage: string
	fullhistory: boolean
	templates: boolean
	namespace: namespace
	assignknownusers: boolean
	rootpage: string
	tags: string | string[]
	token: string
}

export interface ApiFormatJsonParams extends ApiParams {
	callback: string
	utf8: boolean
	ascii: boolean
	formatversion: '1' | '2' | 'latest'
}

export interface JsonConfigJCApiParams extends ApiParams {
	command: 'reload' | 'reset' | 'status'
	namespace: number
	title: string
	content: string
}

export interface JsonConfigJCDataApiParams extends ApiParams {
	title: string
}

export interface ApiFormatJsonParams extends ApiParams {
	wrappedhtml: boolean
	callback: string
	utf8: boolean
	ascii: boolean
	formatversion: '1' | '2' | 'latest'
}

export interface ApiLanguageSearchParams extends ApiParams {
	search: string
	typos: number
}

export interface ApiLinkAccountParams extends ApiParams {
	requests: string | string[]
	messageformat: 'html' | 'none' | 'raw' | 'wikitext'
	mergerequestfields: boolean
	returnurl: string
	continue: boolean
	token: string
}

export interface ApiLoginParams extends ApiParams {
	name: string
	password: password
	domain: string
	token: string
}

export interface ApiLogoutParams extends ApiParams {
	token: string
}

export interface ApiManageTagsParams extends ApiParams {
	operation: 'activate' | 'create' | 'deactivate' | 'delete'
	tag: string
	reason: string
	ignorewarnings: boolean
	tags: string | string[]
	token: string
}

export interface MediaWikiMassMessageApiApiMassMessageParams extends ApiParams {
	spamlist: string
	subject: string
	message: string
	'page-message': string
	token: string
}

export interface ApiMergeHistoryParams extends ApiParams {
	from: string
	fromid: number
	to: string
	toid: number
	timestamp: timestamp
	reason: string
	token: string
}

export interface MobileFrontendApiApiMobileViewParams extends ApiParams {
	page: string
	redirect: 'no' | 'yes'
	sections: string
	prop: ('contentmodel' | 'description' | 'displaytitle' | 'editable' | 'hasvariants' | 'id' | 'image' | 'languagecount' | 'lastmodified' | 'lastmodifiedby' | 'namespace' | 'normalizedtitle' | 'pageprops' | 'protection' | 'revision' | 'sections' | 'text' | 'thumb')[]
	sectionprop: ('anchor' | 'fromtitle' | 'index' | 'level' | 'line' | 'number' | 'toclevel')[]
	pageprops: string
	variant: string
	noheadings: boolean
	notransform: boolean
	onlyrequestedsections: boolean
	offset: number
	maxlen: number
	revision: number
	thumbheight: number
	thumbwidth: number
	thumbsize: number
}

export interface ApiMoveParams extends ApiParams {
	from: string
	fromid: number
	to: string
	reason: string
	movetalk: boolean
	movesubpages: boolean
	noredirect: boolean
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	ignorewarnings: boolean
	tags: string | string[]
	token: string
}

export interface ApiFormatNoneParams extends ApiParams {

}

export interface MediaWikiExtensionOATHAuthApiModuleApiOATHValidateParams extends ApiParams {
	user: string
	totp: string
	data: string
	token: string
}

export interface ApiOpenSearchParams extends ApiParams {
	search: string
	namespace: namespace | namespace[]
	limit: limit
	profile: 'classic' | 'engine_autoselect' | 'fast-fuzzy' | 'fuzzy' | 'normal' | 'strict'
	suggest: boolean
	redirects: 'resolve' | 'return'
	format: 'json' | 'jsonfm' | 'xml' | 'xmlfm'
	warningsaserror: boolean
}

export interface ApiOptionsParams extends ApiParams {
	reset: boolean
	resetkinds: ('all' | 'registered' | 'registered-checkmatrix' | 'registered-multiselect' | 'special' | 'unused' | 'userjs')[]
	change: string | string[]
	optionname: string
	optionvalue: string
	token: string
}

export interface MediaWikiExtensionPageTriageApiApiPageTriageActionParams extends ApiParams {
	pageid: number
	reviewed: '0' | '1'
	enqueue: boolean
	token: string
	note: string
	skipnotif: boolean
}

export interface MediaWikiExtensionPageTriageApiApiPageTriageListParams extends ApiParams {
	show_predicted_class_stub: boolean
	show_predicted_class_start: boolean
	show_predicted_class_c: boolean
	show_predicted_class_b: boolean
	show_predicted_class_good: boolean
	show_predicted_class_featured: boolean
	show_predicted_issues_vandalism: boolean
	show_predicted_issues_spam: boolean
	show_predicted_issues_attack: boolean
	show_predicted_issues_none: boolean
	show_predicted_issues_copyvio: boolean
	showbots: boolean
	showredirs: boolean
	showothers: boolean
	showreviewed: boolean
	showunreviewed: boolean
	showdeleted: boolean
	namespace: number
	afc_state: number
	no_category: boolean
	unreferenced: boolean
	no_inbound_links: boolean
	recreated: boolean
	non_autoconfirmed_users: boolean
	learners: boolean
	blocked_users: boolean
	username: string
	date_range_from: timestamp
	date_range_to: timestamp
	page_id: number
	limit: number
	offset: number
	pageoffset: number
	dir: 'newestfirst' | 'newestreview' | 'oldestfirst' | 'oldestreview'
}

export interface MediaWikiExtensionPageTriageApiApiPageTriageStatsParams extends ApiParams {
	show_predicted_class_stub: boolean
	show_predicted_class_start: boolean
	show_predicted_class_c: boolean
	show_predicted_class_b: boolean
	show_predicted_class_good: boolean
	show_predicted_class_featured: boolean
	show_predicted_issues_vandalism: boolean
	show_predicted_issues_spam: boolean
	show_predicted_issues_attack: boolean
	show_predicted_issues_none: boolean
	show_predicted_issues_copyvio: boolean
	showbots: boolean
	showredirs: boolean
	showothers: boolean
	showreviewed: boolean
	showunreviewed: boolean
	showdeleted: boolean
	namespace: number
	afc_state: number
	no_category: boolean
	unreferenced: boolean
	no_inbound_links: boolean
	recreated: boolean
	non_autoconfirmed_users: boolean
	learners: boolean
	blocked_users: boolean
	username: string
	date_range_from: timestamp
	date_range_to: timestamp
	topreviewers: string
}

export interface MediaWikiExtensionPageTriageApiApiPageTriageTagCopyvioParams extends ApiParams {
	revid: number
	token: string
}

export interface MediaWikiExtensionPageTriageApiApiPageTriageTaggingParams extends ApiParams {
	pageid: number
	token: string
	top: string
	bottom: string
	deletion: boolean
	note: string
	taglist: string | string[]
}

export interface ApiParamInfoParams extends ApiParams {
	modules: string | string[]
	helpformat: 'html' | 'none' | 'raw' | 'wikitext'
	querymodules: ('abusefilters' | 'abuselog' | 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allmessages' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'allusers' | 'authmanagerinfo' | 'babel' | 'backlinks' | 'betafeatures' | 'blocks' | 'categories' | 'categoryinfo' | 'categorymembers' | 'centralnoticeactivecampaigns' | 'centralnoticelogs' | 'checkuser' | 'checkuserlog' | 'cirrusbuilddoc' | 'cirruscompsuggestbuilddoc' | 'cirrusdoc' | 'contenttranslation' | 'contenttranslationcorpora' | 'contenttranslationlangtrend' | 'contenttranslationstats' | 'contenttranslationsuggestions' | 'contributors' | 'coordinates' | 'cxdeletedtranslations' | 'cxpublishedtranslations' | 'cxtranslatorstats' | 'deletedrevisions' | 'deletedrevs' | 'description' | 'duplicatefiles' | 'embeddedin' | 'extlinks' | 'extracts' | 'exturlusage' | 'featureusage' | 'filearchive' | 'filerepoinfo' | 'fileusage' | 'flagged' | 'gadgetcategories' | 'gadgets' | 'geosearch' | 'gettingstartedgetpages' | 'globalallusers' | 'globalblocks' | 'globalgroups' | 'globalpreferences' | 'globalrenamestatus' | 'globalusage' | 'globaluserinfo' | 'imageinfo' | 'images' | 'imageusage' | 'info' | 'iwbacklinks' | 'iwlinks' | 'langbacklinks' | 'langlinks' | 'langlinkscount' | 'languageinfo' | 'links' | 'linkshere' | 'linterrors' | 'linterstats' | 'logevents' | 'mapdata' | 'mmsites' | 'mostviewed' | 'mystashedfiles' | 'notifications' | 'oath' | 'oldreviewedpages' | 'ores' | 'pageassessments' | 'pageimages' | 'pagepropnames' | 'pageprops' | 'pageswithprop' | 'pageterms' | 'pageviews' | 'prefixsearch' | 'projectpages' | 'projects' | 'protectedtitles' | 'querypage' | 'random' | 'readinglistentries' | 'readinglists' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'siteinfo' | 'siteviews' | 'stashimageinfo' | 'tags' | 'templates' | 'tokens' | 'transcludedin' | 'transcodestatus' | 'unreadnotificationpages' | 'usercontribs' | 'userinfo' | 'users' | 'videoinfo' | 'watchlist' | 'watchlistraw' | 'wbentityusage' | 'wblistentityusage' | 'wikibase' | 'wikisets')[]
	mainmodule: string
	pagesetmodule: string
	formatmodules: ('json' | 'jsonfm' | 'none' | 'php' | 'phpfm' | 'rawfm' | 'xml' | 'xmlfm')[]
}

export interface ApiParseParams extends ApiParams {
	title: string
	text: string
	revid: number
	summary: string
	page: string
	pageid: number
	redirects: boolean
	oldid: number
	prop: ('categories' | 'categorieshtml' | 'displaytitle' | 'encodedjsconfigvars' | 'externallinks' | 'headhtml' | 'images' | 'indicators' | 'iwlinks' | 'jsconfigvars' | 'langlinks' | 'limitreportdata' | 'limitreporthtml' | 'links' | 'modules' | 'parsetree' | 'parsewarnings' | 'properties' | 'revid' | 'sections' | 'templates' | 'text' | 'wikitext' | 'headitems')[]
	wrapoutputclass: string
	pst: boolean
	onlypst: boolean
	effectivelanglinks: boolean
	section: string
	sectiontitle: string
	disablepp: boolean
	disablelimitreport: boolean
	disableeditsection: boolean
	disablestylededuplication: boolean
	generatexml: boolean
	preview: boolean
	sectionpreview: boolean
	disabletoc: boolean
	useskin: 'minerva' | 'modern' | 'monobook' | 'timeless' | 'vector'
	contentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	contentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	mobileformat: boolean
	mainpage: boolean
	templatesandboxprefix: string | string[]
	templatesandboxtitle: string
	templatesandboxtext: string
	templatesandboxcontentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	templatesandboxcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
}

export interface ApiPatrolParams extends ApiParams {
	rcid: number
	revid: number
	tags: string | string[]
	token: string
}

export interface ApiFormatPhpParams extends ApiParams {
	formatversion: '1' | '2' | 'latest'
}

export interface ApiFormatPhpParams extends ApiParams {
	wrappedhtml: boolean
	formatversion: '1' | '2' | 'latest'
}

export interface ApiProtectParams extends ApiParams {
	title: string
	pageid: number
	protections: string | string[]
	expiry: string | string[]
	reason: string
	tags: string | string[]
	cascade: boolean
	watch: boolean
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	token: string
}

export interface ApiPurgeParams extends ApiParams {
	forcelinkupdate: boolean
	forcerecursivelinkupdate: boolean
	continue: string
	titles: string | string[]
	pageids: number | number[]
	revids: number | number[]
	generator: 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'backlinks' | 'categories' | 'categorymembers' | 'contenttranslation' | 'contenttranslationsuggestions' | 'deletedrevisions' | 'duplicatefiles' | 'embeddedin' | 'exturlusage' | 'fileusage' | 'geosearch' | 'gettingstartedgetpages' | 'images' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'links' | 'linkshere' | 'mostviewed' | 'oldreviewedpages' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'templates' | 'transcludedin' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'readinglistentries'
	redirects: boolean
	converttitles: boolean
}

export interface ApiQueryParams extends ApiParams {
	prop: ('categories' | 'categoryinfo' | 'cirrusbuilddoc' | 'cirruscompsuggestbuilddoc' | 'cirrusdoc' | 'contributors' | 'coordinates' | 'deletedrevisions' | 'duplicatefiles' | 'extlinks' | 'extracts' | 'fileusage' | 'flagged' | 'globalusage' | 'imageinfo' | 'images' | 'info' | 'iwlinks' | 'langlinks' | 'langlinkscount' | 'links' | 'linkshere' | 'pageassessments' | 'pageimages' | 'pageprops' | 'pageterms' | 'pageviews' | 'redirects' | 'revisions' | 'stashimageinfo' | 'templates' | 'transcludedin' | 'transcodestatus' | 'videoinfo' | 'wbentityusage' | 'description' | 'mapdata')[]
	list: ('abusefilters' | 'abuselog' | 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'allusers' | 'backlinks' | 'betafeatures' | 'blocks' | 'categorymembers' | 'centralnoticeactivecampaigns' | 'centralnoticelogs' | 'checkuser' | 'checkuserlog' | 'contenttranslation' | 'contenttranslationcorpora' | 'contenttranslationlangtrend' | 'contenttranslationstats' | 'contenttranslationsuggestions' | 'cxpublishedtranslations' | 'cxtranslatorstats' | 'embeddedin' | 'exturlusage' | 'filearchive' | 'gadgetcategories' | 'gadgets' | 'geosearch' | 'gettingstartedgetpages' | 'globalallusers' | 'globalblocks' | 'globalgroups' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'linterrors' | 'logevents' | 'mostviewed' | 'mystashedfiles' | 'oldreviewedpages' | 'pagepropnames' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'projects' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'search' | 'tags' | 'usercontribs' | 'users' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'wikisets' | 'deletedrevs' | 'mmsites' | 'readinglistentries')[]
	meta: ('allmessages' | 'authmanagerinfo' | 'babel' | 'featureusage' | 'filerepoinfo' | 'globalpreferences' | 'globalrenamestatus' | 'globaluserinfo' | 'languageinfo' | 'linterstats' | 'notifications' | 'ores' | 'siteinfo' | 'siteviews' | 'tokens' | 'unreadnotificationpages' | 'userinfo' | 'wikibase' | 'cxdeletedtranslations' | 'oath' | 'readinglists')[]
	indexpageids: boolean
	export: boolean
	exportnowrap: boolean
	exportschema: '0.10' | '0.11'
	iwurl: boolean
	continue: string
	rawcontinue: boolean
	titles: string | string[]
	pageids: number | number[]
	revids: number | number[]
	generator: 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'backlinks' | 'categories' | 'categorymembers' | 'contenttranslation' | 'contenttranslationsuggestions' | 'deletedrevisions' | 'duplicatefiles' | 'embeddedin' | 'exturlusage' | 'fileusage' | 'geosearch' | 'gettingstartedgetpages' | 'images' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'links' | 'linkshere' | 'mostviewed' | 'oldreviewedpages' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'templates' | 'transcludedin' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'readinglistentries'
	redirects: boolean
	converttitles: boolean
}

export interface ApiFormatJsonParams extends ApiParams {
	wrappedhtml: boolean
}

export interface MediaWikiExtensionsReadingListsApiApiReadingListsParams extends ApiParams {
	command: 'create' | 'createentry' | 'delete' | 'deleteentry' | 'setup' | 'teardown' | 'update'
	token: string
}

export interface MediaWikiLinterApiRecordLintParams extends ApiParams {
	data: string
	page: string
	revision: number
}

export interface ApiRemoveAuthenticationDataParams extends ApiParams {
	request: string
	token: string
}

export interface ApiResetPasswordParams extends ApiParams {
	user: string
	email: string
	token: string
}

export interface ApiReviewParams extends ApiParams {
	revid: string
	token: string
	comment: string
	unapprove: boolean
}

export interface ApiReviewActivityParams extends ApiParams {
	previd: string
	oldid: string
	reviewing: '0' | '1'
	token: string
}

export interface ApiRevisionDeleteParams extends ApiParams {
	type: 'archive' | 'filearchive' | 'logging' | 'oldimage' | 'revision'
	target: string
	ids: string | string[]
	hide: ('comment' | 'content' | 'user')[]
	show: ('comment' | 'content' | 'user')[]
	suppress: 'no' | 'nochange' | 'yes'
	reason: string
	tags: string | string[]
	token: string
}

export interface ApiRollbackParams extends ApiParams {
	title: string
	pageid: number
	tags: string | string[]
	user: string
	summary: string
	markbot: boolean
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	token: string
}

export interface ApiRsdParams extends ApiParams {

}

export interface KartographerApiSanitizeMapDataParams extends ApiParams {
	title: string
	text: string
}

export interface ApiScribuntoConsoleParams extends ApiParams {
	title: string
	content: string
	session: number
	question: string
	clear: boolean
}

export interface ApiSetGlobalAccountStatusParams extends ApiParams {
	user: string
	locked: '' | 'lock' | 'unlock'
	hidden: '' | 'lists' | 'suppressed'
	reason: string
	statecheck: string
	token: string
}

export interface ApiSetNotificationTimestampParams extends ApiParams {
	entirewatchlist: boolean
	timestamp: timestamp
	torevid: number
	newerthanrevid: number
	continue: string
	titles: string | string[]
	pageids: number | number[]
	revids: number | number[]
	generator: 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'backlinks' | 'categories' | 'categorymembers' | 'contenttranslation' | 'contenttranslationsuggestions' | 'deletedrevisions' | 'duplicatefiles' | 'embeddedin' | 'exturlusage' | 'fileusage' | 'geosearch' | 'gettingstartedgetpages' | 'images' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'links' | 'linkshere' | 'mostviewed' | 'oldreviewedpages' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'templates' | 'transcludedin' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'readinglistentries'
	redirects: boolean
	converttitles: boolean
	token: string
}

export interface ApiSetPageLanguageParams extends ApiParams {
	title: string
	pageid: number
	lang: 'ab' | 'abs' | 'ace' | 'ady' | 'ady-cyrl' | 'aeb' | 'aeb-arab' | 'aeb-latn' | 'af' | 'ak' | 'aln' | 'alt' | 'am' | 'ami' | 'an' | 'ang' | 'anp' | 'ar' | 'arc' | 'arn' | 'arq' | 'ary' | 'arz' | 'as' | 'ase' | 'ast' | 'atj' | 'av' | 'avk' | 'awa' | 'ay' | 'az' | 'azb' | 'ba' | 'ban' | 'ban-bali' | 'bar' | 'bbc' | 'bbc-latn' | 'bcc' | 'bcl' | 'be' | 'be-tarask' | 'bg' | 'bgn' | 'bh' | 'bho' | 'bi' | 'bjn' | 'bm' | 'bn' | 'bo' | 'bpy' | 'bqi' | 'br' | 'brh' | 'bs' | 'btm' | 'bto' | 'bug' | 'bxr' | 'ca' | 'cbk-zam' | 'cdo' | 'ce' | 'ceb' | 'ch' | 'chr' | 'chy' | 'ckb' | 'co' | 'cps' | 'cr' | 'crh' | 'crh-cyrl' | 'crh-latn' | 'cs' | 'csb' | 'cu' | 'cv' | 'cy' | 'da' | 'de' | 'de-at' | 'de-ch' | 'de-formal' | 'default' | 'din' | 'diq' | 'dsb' | 'dtp' | 'dty' | 'dv' | 'dz' | 'ee' | 'egl' | 'el' | 'eml' | 'en' | 'en-ca' | 'en-gb' | 'eo' | 'es' | 'es-formal' | 'et' | 'eu' | 'ext' | 'fa' | 'ff' | 'fi' | 'fit' | 'fj' | 'fo' | 'fr' | 'frc' | 'frp' | 'frr' | 'fur' | 'fy' | 'ga' | 'gag' | 'gan' | 'gan-hans' | 'gan-hant' | 'gcr' | 'gd' | 'gl' | 'glk' | 'gn' | 'gom' | 'gom-deva' | 'gom-latn' | 'gor' | 'got' | 'grc' | 'gsw' | 'gu' | 'gv' | 'ha' | 'hak' | 'haw' | 'he' | 'hi' | 'hif' | 'hif-latn' | 'hil' | 'hr' | 'hrx' | 'hsb' | 'ht' | 'hu' | 'hu-formal' | 'hy' | 'hyw' | 'ia' | 'id' | 'ie' | 'ig' | 'ii' | 'ik' | 'ike-cans' | 'ike-latn' | 'ilo' | 'inh' | 'io' | 'is' | 'it' | 'iu' | 'ja' | 'jam' | 'jbo' | 'jut' | 'jv' | 'ka' | 'kaa' | 'kab' | 'kbd' | 'kbd-cyrl' | 'kbp' | 'kg' | 'khw' | 'ki' | 'kiu' | 'kjp' | 'kk' | 'kk-arab' | 'kk-cn' | 'kk-cyrl' | 'kk-kz' | 'kk-latn' | 'kk-tr' | 'kl' | 'km' | 'kn' | 'ko' | 'ko-kp' | 'koi' | 'krc' | 'kri' | 'krj' | 'krl' | 'ks' | 'ks-arab' | 'ks-deva' | 'ksh' | 'ku' | 'ku-arab' | 'ku-latn' | 'kum' | 'kv' | 'kw' | 'ky' | 'la' | 'lad' | 'lb' | 'lbe' | 'lez' | 'lfn' | 'lg' | 'li' | 'lij' | 'liv' | 'lki' | 'lld' | 'lmo' | 'ln' | 'lo' | 'loz' | 'lrc' | 'lt' | 'ltg' | 'lus' | 'luz' | 'lv' | 'lzh' | 'lzz' | 'mad' | 'mai' | 'map-bms' | 'mdf' | 'mg' | 'mhr' | 'mi' | 'min' | 'mk' | 'ml' | 'mn' | 'mni' | 'mnw' | 'mo' | 'mr' | 'mrh' | 'mrj' | 'ms' | 'mt' | 'mwl' | 'my' | 'myv' | 'mzn' | 'na' | 'nah' | 'nan' | 'nap' | 'nb' | 'nds' | 'nds-nl' | 'ne' | 'new' | 'nia' | 'niu' | 'nl' | 'nl-informal' | 'nn' | 'nov' | 'nqo' | 'nrm' | 'nso' | 'nv' | 'ny' | 'nys' | 'oc' | 'olo' | 'om' | 'or' | 'os' | 'pa' | 'pag' | 'pam' | 'pap' | 'pcd' | 'pdc' | 'pdt' | 'pfl' | 'pi' | 'pih' | 'pl' | 'pms' | 'pnb' | 'pnt' | 'prg' | 'ps' | 'pt' | 'pt-br' | 'qu' | 'qug' | 'rgn' | 'rif' | 'rm' | 'rmy' | 'ro' | 'roa-tara' | 'ru' | 'rue' | 'rup' | 'ruq' | 'ruq-cyrl' | 'ruq-latn' | 'rw' | 'sa' | 'sah' | 'sat' | 'sc' | 'scn' | 'sco' | 'sd' | 'sdc' | 'sdh' | 'se' | 'sei' | 'ses' | 'sg' | 'sgs' | 'sh' | 'shi' | 'shn' | 'shy-latn' | 'si' | 'sk' | 'skr' | 'skr-arab' | 'sl' | 'sli' | 'sm' | 'sma' | 'smn' | 'sn' | 'so' | 'sq' | 'sr' | 'sr-ec' | 'sr-el' | 'srn' | 'ss' | 'st' | 'stq' | 'sty' | 'su' | 'sv' | 'sw' | 'szl' | 'szy' | 'ta' | 'tay' | 'tcy' | 'te' | 'tet' | 'tg' | 'tg-cyrl' | 'tg-latn' | 'th' | 'ti' | 'tk' | 'tl' | 'tly' | 'tn' | 'to' | 'tpi' | 'tr' | 'tru' | 'trv' | 'ts' | 'tt' | 'tt-cyrl' | 'tt-latn' | 'tw' | 'ty' | 'tyv' | 'tzm' | 'udm' | 'ug' | 'ug-arab' | 'ug-latn' | 'uk' | 'ur' | 'uz' | 've' | 'vec' | 'vep' | 'vi' | 'vls' | 'vmf' | 'vo' | 'vot' | 'vro' | 'wa' | 'war' | 'wo' | 'wuu' | 'xal' | 'xh' | 'xmf' | 'xsy' | 'yi' | 'yo' | 'yue' | 'za' | 'zea' | 'zgh' | 'zh' | 'zh-cn' | 'zh-hans' | 'zh-hant' | 'zh-hk' | 'zh-mo' | 'zh-my' | 'zh-sg' | 'zh-tw' | 'zu'
	reason: string
	tags: string | string[]
	token: string
}

export interface ApiShortenUrlParams extends ApiParams {
	url: string
}

export interface MediaWikiExtensionSiteMatrixApiSiteMatrixParams extends ApiParams {
	type: ('language' | 'special')[]
	state: ('all' | 'closed' | 'fishbowl' | 'nonglobal' | 'private')[]
	langprop: ('code' | 'dir' | 'localname' | 'name' | 'site')[]
	siteprop: ('code' | 'dbname' | 'lang' | 'sitename' | 'url')[]
	limit: limit
	continue: string
}

export interface ApiSpamBlacklistParams extends ApiParams {
	url: string | string[]
}

export interface ApiStabilizeProtectParams extends ApiParams {
	protectlevel: 'autoconfirmed' | 'none'
	expiry: string
	reason: string
	watch: string
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	token: string
	title: string
}

export interface ApiStashEditParams extends ApiParams {
	title: string
	section: string
	sectiontitle: string
	text: string
	stashedtexthash: string
	summary: string
	contentmodel: 'GadgetDefinition' | 'JsonSchema' | 'MassMessageListContent' | 'Scribunto' | 'SecurePoll' | 'css' | 'javascript' | 'json' | 'sanitized-css' | 'text' | 'unknown' | 'wikitext'
	contentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	baserevid: number
	token: string
}

export interface MediaWikiExtensionEventStreamConfigApiStreamConfigsParams extends ApiParams {
	streams: string | string[]
	constraints: string | string[]
	all_settings: boolean
}

export interface MediaWikiExtensionsSecurePollApiApiStrikeVoteParams extends ApiParams {
	option: 'strike' | 'unstrike'
	reason: string
	voteid: number
	token: string
}

export interface ApiTagParams extends ApiParams {
	rcid: number | number[]
	revid: number | number[]
	logid: number | number[]
	add: ('AWB' | 'Image up for deletion on Commons' | 'Manual revert' | 'ProveIt edit' | 'RedWarn' | 'STiki' | 'WPCleaner' | 'WikiLoop Battlefield' | 'bot trial' | 'discretionary' | 'editProtectedHelper' | 'huggle' | 'large non-free file' | 'predatory' | 'self-published-blog' | 'self-published source' | 'twinkle')[]
	remove: string | string[]
	reason: string
	tags: string | string[]
	token: string
}

export interface ApiTemplateDataParams extends ApiParams {
	includeMissingTitles: boolean
	doNotIgnoreMissingTitles: boolean
	lang: string
	titles: string | string[]
	pageids: number | number[]
	revids: number | number[]
	generator: 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'backlinks' | 'categories' | 'categorymembers' | 'contenttranslation' | 'contenttranslationsuggestions' | 'deletedrevisions' | 'duplicatefiles' | 'embeddedin' | 'exturlusage' | 'fileusage' | 'geosearch' | 'gettingstartedgetpages' | 'images' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'links' | 'linkshere' | 'mostviewed' | 'oldreviewedpages' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'templates' | 'transcludedin' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'readinglistentries'
	redirects: boolean
	converttitles: boolean
}

export interface ApiCoreThankParams extends ApiParams {
	rev: number
	log: number
	token: string
	source: string
}

export interface ApiTimedTextParams extends ApiParams {
	title: string
	pageid: number
	trackformat: 'srt' | 'vtt'
	lang: string
}

export interface ApiQueryTitleBlacklistParams extends ApiParams {
	title: string
	action: 'create' | 'createpage' | 'createtalk' | 'edit' | 'move' | 'new-account' | 'upload'
	nooverride: boolean
}

export interface ApiTokensParams extends ApiParams {
	type: ('block' | 'createaccount' | 'csrf' | 'delete' | 'deleteglobalaccount' | 'edit' | 'email' | 'import' | 'login' | 'move' | 'options' | 'patrol' | 'protect' | 'rollback' | 'setglobalaccountstatus' | 'unblock' | 'userrights' | 'watch')[]
}

export interface ApiTranscodeResetParams extends ApiParams {
	title: string
	transcodekey: string
	token: string
}

export interface ApiULSLocalizationParams extends ApiParams {
	language: string
}

export interface ApiULSSetLanguageParams extends ApiParams {
	languagecode: string
	token: string
}

export interface ApiUnblockParams extends ApiParams {
	id: number
	user: string
	userid: number
	reason: string
	tags: string | string[]
	token: string
}

export interface ApiUndeleteParams extends ApiParams {
	title: string
	reason: string
	tags: string | string[]
	timestamps: timestamp | timestamp[]
	fileids: number | number[]
	watchlist: 'nochange' | 'preferences' | 'unwatch' | 'watch'
	token: string
}

export interface ApiRemoveAuthenticationDataParams extends ApiParams {
	request: string
	token: string
}

export interface ApiUploadParams extends ApiParams {
	filename: string
	comment: string
	tags: string | string[]
	text: string
	watch: boolean
	watchlist: 'nochange' | 'preferences' | 'watch'
	ignorewarnings: boolean
	file: upload
	url: string
	filekey: string
	sessionkey: string
	stash: boolean
	filesize: number
	offset: number
	chunk: upload
	async: boolean
	checkstatus: boolean
	token: string
}

export interface ApiUserrightsParams extends ApiParams {
	user: string
	userid: number
	add: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	expiry: string | string[]
	remove: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	reason: string
	token: string
	tags: string | string[]
}

export interface ApiValidatePasswordParams extends ApiParams {
	password: password
	user: string
	email: string
	realname: string
}

export interface ApiVisualEditorParams extends ApiParams {
	page: string
	badetag: string
	format: 'json' | 'jsonfm'
	paction: 'metadata' | 'parse' | 'parsedoc' | 'parsefragment' | 'templatesused' | 'wikitext'
	wikitext: string
	section: string
	stash: string
	oldid: string
	editintro: string
	pst: boolean
	preload: string
	preloadparams: string | string[]
}

export interface ApiVisualEditorEditParams extends ApiParams {
	paction: 'diff' | 'save' | 'serialize' | 'serializeforcache'
	page: string
	token: string
	wikitext: string
	section: string
	sectiontitle: string
	basetimestamp: string
	starttimestamp: string
	oldid: string
	minor: string
	watchlist: string
	html: string
	etag: string
	summary: string
	captchaid: string
	captchaword: string
	cachekey: string
	tags: string | string[]
}

export interface ApiWatchParams extends ApiParams {
	title: string
	unwatch: boolean
	continue: string
	titles: string | string[]
	pageids: number | number[]
	revids: number | number[]
	generator: 'allcategories' | 'alldeletedrevisions' | 'allfileusages' | 'allimages' | 'alllinks' | 'allpages' | 'allredirects' | 'allrevisions' | 'alltransclusions' | 'backlinks' | 'categories' | 'categorymembers' | 'contenttranslation' | 'contenttranslationsuggestions' | 'deletedrevisions' | 'duplicatefiles' | 'embeddedin' | 'exturlusage' | 'fileusage' | 'geosearch' | 'gettingstartedgetpages' | 'images' | 'imageusage' | 'iwbacklinks' | 'langbacklinks' | 'links' | 'linkshere' | 'mostviewed' | 'oldreviewedpages' | 'pageswithprop' | 'prefixsearch' | 'projectpages' | 'protectedtitles' | 'querypage' | 'random' | 'recentchanges' | 'redirects' | 'revisions' | 'search' | 'templates' | 'transcludedin' | 'watchlist' | 'watchlistraw' | 'wblistentityusage' | 'readinglistentries'
	redirects: boolean
	converttitles: boolean
	token: string
}

export interface MobileFrontendApiApiWebappManifestParams extends ApiParams {

}

export interface MediaWikiExtensionWebAuthnApiWebAuthnParams extends ApiParams {
	func: string
	data: string
}

export interface ApiWikiLoveParams extends ApiParams {
	title: string
	text: string
	message: string
	token: string
	subject: string
	type: string
	email: string
	tags: string | string[]
}

export interface ApiFormatXmlParams extends ApiParams {
	xslt: string
	includexmlnamespace: boolean
}

export interface ApiFormatXmlParams extends ApiParams {
	wrappedhtml: boolean
	xslt: string
	includexmlnamespace: boolean
}

export interface ApiQueryAbuseFiltersParams extends ApiQueryParams {
	abfstartid: number
	abfendid: number
	abfdir: 'newer' | 'older'
	abfshow: ('!deleted' | '!enabled' | '!private' | 'deleted' | 'enabled' | 'private')[]
	abflimit: limit
	abfprop: ('actions' | 'comments' | 'description' | 'hits' | 'id' | 'lasteditor' | 'lastedittime' | 'pattern' | 'private' | 'status')[]
}

export interface ApiQueryAbuseLogParams extends ApiQueryParams {
	afllogid: number
	aflstart: timestamp
	aflend: timestamp
	afldir: 'newer' | 'older'
	afluser: string
	afltitle: string
	aflfilter: string | string[]
	afllimit: limit
	aflprop: ('action' | 'details' | 'filter' | 'hidden' | 'ids' | 'result' | 'revid' | 'timestamp' | 'title' | 'user')[]
}

export interface ApiQueryAllCategoriesParams extends ApiQueryParams {
	acfrom: string
	accontinue: string
	acto: string
	acprefix: string
	acdir: 'ascending' | 'descending'
	acmin: number
	acmax: number
	aclimit: limit
	acprop: ('hidden' | 'size')[]
}

export interface ApiQueryAllDeletedRevisionsParams extends ApiQueryParams {
	adrprop: ('comment' | 'content' | 'contentmodel' | 'flags' | 'ids' | 'parsedcomment' | 'roles' | 'sha1' | 'size' | 'slotsha1' | 'slotsize' | 'tags' | 'timestamp' | 'user' | 'userid' | 'parsetree')[]
	adrslots: ('main')[]
	adrlimit: limit
	adrexpandtemplates: boolean
	adrgeneratexml: boolean
	adrparse: boolean
	adrsection: string
	adrdiffto: string
	adrdifftotext: string
	adrdifftotextpst: boolean
	adrcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	adruser: string
	adrnamespace: namespace | namespace[]
	adrstart: timestamp
	adrend: timestamp
	adrdir: 'newer' | 'older'
	adrfrom: string
	adrto: string
	adrprefix: string
	adrexcludeuser: string
	adrtag: string
	adrcontinue: string
	adrgeneratetitles: boolean
}

export interface ApiQueryAllLinksParams extends ApiQueryParams {
	afcontinue: string
	affrom: string
	afto: string
	afprefix: string
	afunique: boolean
	afprop: ('ids' | 'title')[]
	aflimit: limit
	afdir: 'ascending' | 'descending'
}

export interface ApiQueryAllImagesParams extends ApiQueryParams {
	aisort: 'name' | 'timestamp'
	aidir: 'ascending' | 'descending' | 'newer' | 'older'
	aifrom: string
	aito: string
	aicontinue: string
	aistart: timestamp
	aiend: timestamp
	aiprop: ('badfile' | 'bitdepth' | 'canonicaltitle' | 'comment' | 'commonmetadata' | 'dimensions' | 'extmetadata' | 'mediatype' | 'metadata' | 'mime' | 'parsedcomment' | 'sha1' | 'size' | 'timestamp' | 'url' | 'user' | 'userid')[]
	aiprefix: string
	aiminsize: number
	aimaxsize: number
	aisha1: string
	aisha1base36: string
	aiuser: string
	aifilterbots: 'all' | 'bots' | 'nobots'
	aimime: string | string[]
	ailimit: limit
}

export interface ApiQueryAllLinksParams extends ApiQueryParams {
	alcontinue: string
	alfrom: string
	alto: string
	alprefix: string
	alunique: boolean
	alprop: ('ids' | 'title')[]
	alnamespace: namespace
	allimit: limit
	aldir: 'ascending' | 'descending'
}

export interface ApiQueryAllMessagesParams extends ApiQueryParams {
	ammessages: string | string[]
	amprop: ('default')[]
	amenableparser: boolean
	amnocontent: boolean
	amincludelocal: boolean
	amargs: string | string[]
	amfilter: string
	amcustomised: 'all' | 'modified' | 'unmodified'
	amlang: string
	amfrom: string
	amto: string
	amtitle: string
	amprefix: string
}

export interface ApiQueryAllPagesParams extends ApiQueryParams {
	apfrom: string
	apcontinue: string
	apto: string
	apprefix: string
	apnamespace: namespace
	apfilterredir: 'all' | 'nonredirects' | 'redirects'
	apminsize: number
	apmaxsize: number
	apprtype: ('edit' | 'move' | 'upload')[]
	apprlevel: ('' | 'autoconfirmed' | 'extendedconfirmed' | 'sysop' | 'templateeditor')[]
	apprfiltercascade: 'all' | 'cascading' | 'noncascading'
	aplimit: limit
	apdir: 'ascending' | 'descending'
	apfilterlanglinks: 'all' | 'withlanglinks' | 'withoutlanglinks'
	apprexpiry: 'all' | 'definite' | 'indefinite'
}

export interface ApiQueryAllLinksParams extends ApiQueryParams {
	arcontinue: string
	arfrom: string
	arto: string
	arprefix: string
	arunique: boolean
	arprop: ('fragment' | 'ids' | 'interwiki' | 'title')[]
	arnamespace: namespace
	arlimit: limit
	ardir: 'ascending' | 'descending'
}

export interface ApiQueryAllRevisionsParams extends ApiQueryParams {
	arvprop: ('comment' | 'content' | 'contentmodel' | 'flags' | 'ids' | 'oresscores' | 'parsedcomment' | 'roles' | 'sha1' | 'size' | 'slotsha1' | 'slotsize' | 'tags' | 'timestamp' | 'user' | 'userid' | 'parsetree')[]
	arvslots: ('main')[]
	arvlimit: limit
	arvexpandtemplates: boolean
	arvgeneratexml: boolean
	arvparse: boolean
	arvsection: string
	arvdiffto: string
	arvdifftotext: string
	arvdifftotextpst: boolean
	arvcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	arvuser: string
	arvnamespace: namespace | namespace[]
	arvstart: timestamp
	arvend: timestamp
	arvdir: 'newer' | 'older'
	arvexcludeuser: string
	arvcontinue: string
	arvgeneratetitles: boolean
}

export interface ApiQueryAllLinksParams extends ApiQueryParams {
	atcontinue: string
	atfrom: string
	atto: string
	atprefix: string
	atunique: boolean
	atprop: ('ids' | 'title')[]
	atnamespace: namespace
	atlimit: limit
	atdir: 'ascending' | 'descending'
}

export interface ApiQueryAllUsersParams extends ApiQueryParams {
	aufrom: string
	auto: string
	auprefix: string
	audir: 'ascending' | 'descending'
	augroup: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	auexcludegroup: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	aurights: ('abusefilter-hidden-log' | 'abusefilter-hide-log' | 'abusefilter-log' | 'abusefilter-log-detail' | 'abusefilter-log-private' | 'abusefilter-modify' | 'abusefilter-modify-global' | 'abusefilter-modify-restricted' | 'abusefilter-privatedetails' | 'abusefilter-privatedetails-log' | 'abusefilter-revert' | 'abusefilter-view' | 'abusefilter-view-private' | 'apihighlimits' | 'applychangetags' | 'autoconfirmed' | 'autocreateaccount' | 'autopatrol' | 'autoreview' | 'autoreviewrestore' | 'bigdelete' | 'block' | 'blockemail' | 'bot' | 'browsearchive' | 'centralauth-lock' | 'centralauth-merge' | 'centralauth-oversight' | 'centralauth-rename' | 'centralauth-unmerge' | 'centralauth-usermerge' | 'changetags' | 'checkuser' | 'checkuser-log' | 'collectionsaveascommunitypage' | 'collectionsaveasuserpage' | 'createaccount' | 'createpage' | 'createpagemainns' | 'createtalk' | 'delete' | 'delete-redirect' | 'deletechangetags' | 'deletedhistory' | 'deletedtext' | 'deletelogentry' | 'deleterevision' | 'edit' | 'editautoreviewprotected' | 'editcontentmodel' | 'editeditorprotected' | 'editextendedsemiprotected' | 'editinterface' | 'editmyoptions' | 'editmyprivateinfo' | 'editmyusercss' | 'editmyuserjs' | 'editmyuserjson' | 'editmyuserjsredirect' | 'editmywatchlist' | 'editprotected' | 'editsemiprotected' | 'editsitecss' | 'editsitejs' | 'editsitejson' | 'editusercss' | 'edituserjs' | 'edituserjson' | 'extendedconfirmed' | 'flow-create-board' | 'flow-delete' | 'flow-edit-post' | 'flow-hide' | 'flow-suppress' | 'gadgets-definition-edit' | 'gadgets-edit' | 'globalblock' | 'globalblock-exempt' | 'globalblock-whitelist' | 'globalgroupmembership' | 'globalgrouppermissions' | 'gwtoolset' | 'hideuser' | 'import' | 'importupload' | 'ipblock-exempt' | 'manage-all-push-subscriptions' | 'managechangetags' | 'markbotedits' | 'massmessage' | 'mergehistory' | 'minoredit' | 'move' | 'move-categorypages' | 'move-rootuserpages' | 'move-subpages' | 'movefile' | 'movestable' | 'mwoauthmanageconsumer' | 'mwoauthmanagemygrants' | 'mwoauthproposeconsumer' | 'mwoauthsuppress' | 'mwoauthupdateownconsumer' | 'mwoauthviewprivate' | 'mwoauthviewsuppressed' | 'newsletter-create' | 'newsletter-delete' | 'newsletter-manage' | 'newsletter-restore' | 'nominornewtalk' | 'noratelimit' | 'nuke' | 'oathauth-api-all' | 'oathauth-disable-for-user' | 'oathauth-enable' | 'oathauth-verify-user' | 'oathauth-view-log' | 'override-antispoof' | 'override-export-depth' | 'pagelang' | 'pagetriage-copyvio' | 'patrol' | 'patrolmarks' | 'protect' | 'purge' | 'read' | 'renameuser' | 'reupload' | 'reupload-own' | 'reupload-shared' | 'review' | 'rollback' | 'securepoll-create-poll' | 'sendemail' | 'setmentor' | 'siteadmin' | 'skipcaptcha' | 'spamblacklistlog' | 'stablesettings' | 'suppressionlog' | 'suppressredirect' | 'suppressrevision' | 'tboverride' | 'tboverride-account' | 'templateeditor' | 'titleblacklistlog' | 'torunblocked' | 'transcode-reset' | 'transcode-status' | 'unblockself' | 'undelete' | 'unreviewedpages' | 'unwatchedpages' | 'upload' | 'upload_by_url' | 'urlshortener-create-url' | 'urlshortener-manage-url' | 'urlshortener-view-log' | 'usermerge' | 'userrights' | 'userrights-interwiki' | 'validate' | 'viewdeletedfile' | 'viewmyprivateinfo' | 'viewmywatchlist' | 'viewsuppressed' | 'vipsscaler-test' | 'writeapi')[]
	auprop: ('blockinfo' | 'centralids' | 'editcount' | 'groups' | 'implicitgroups' | 'registration' | 'rights')[]
	aulimit: limit
	auwitheditsonly: boolean
	auactiveusers: boolean
	auattachedwiki: string
}

export interface ApiQueryAuthManagerInfoParams extends ApiQueryParams {
	amisecuritysensitiveoperation: string
	amirequestsfor: 'change' | 'create' | 'create-continue' | 'link' | 'link-continue' | 'login' | 'login-continue' | 'remove' | 'unlink'
	amimergerequestfields: boolean
	amimessageformat: 'html' | 'none' | 'raw' | 'wikitext'
}

export interface MediaWikiBabelApiQueryBabelParams extends ApiQueryParams {
	babuser: string
}

export interface ApiQueryBacklinksParams extends ApiQueryParams {
	bltitle: string
	blpageid: number
	blcontinue: string
	blnamespace: namespace | namespace[]
	bldir: 'ascending' | 'descending'
	blfilterredir: 'all' | 'nonredirects' | 'redirects'
	bllimit: limit
	blredirect: boolean
}

export interface ApiQueryBetaFeaturesParams extends ApiQueryParams {
	bfcounts: string
}

export interface ApiQueryBlocksParams extends ApiQueryParams {
	bkstart: timestamp
	bkend: timestamp
	bkdir: 'newer' | 'older'
	bkids: number | number[]
	bkusers: string | string[]
	bkip: string
	bklimit: limit
	bkprop: ('by' | 'byid' | 'expiry' | 'flags' | 'id' | 'range' | 'reason' | 'restrictions' | 'timestamp' | 'user' | 'userid')[]
	bkshow: ('!account' | '!ip' | '!range' | '!temp' | 'account' | 'ip' | 'range' | 'temp')[]
	bkcontinue: string
}

export interface ApiQueryCategoriesParams extends ApiQueryParams {
	clprop: ('hidden' | 'sortkey' | 'timestamp')[]
	clshow: ('!hidden' | 'hidden')[]
	cllimit: limit
	clcontinue: string
	clcategories: string | string[]
	cldir: 'ascending' | 'descending'
}

export interface ApiQueryCategoryInfoParams extends ApiQueryParams {
	cicontinue: string
}

export interface ApiQueryCategoryMembersParams extends ApiQueryParams {
	cmtitle: string
	cmpageid: number
	cmprop: ('ids' | 'sortkey' | 'sortkeyprefix' | 'timestamp' | 'title' | 'type')[]
	cmnamespace: namespace | namespace[]
	cmtype: ('file' | 'page' | 'subcat')[]
	cmcontinue: string
	cmlimit: limit
	cmsort: 'sortkey' | 'timestamp'
	cmdir: 'asc' | 'ascending' | 'desc' | 'descending' | 'newer' | 'older'
	cmstart: timestamp
	cmend: timestamp
	cmstarthexsortkey: string
	cmendhexsortkey: string
	cmstartsortkeyprefix: string
	cmendsortkeyprefix: string
	cmstartsortkey: string
	cmendsortkey: string
}

export interface ApiCentralNoticeQueryActiveCampaignsParams extends ApiQueryParams {
	cnacincludefuture: boolean
}

export interface ApiCentralNoticeLogsParams extends ApiQueryParams {
	campaign: string
	user: string
	limit: limit
	offset: number
	start: timestamp
	end: timestamp
}

export interface ApiQueryCheckUserParams extends ApiQueryParams {
	curequest: 'edits' | 'ipusers' | 'userips'
	cutarget: string
	cureason: string
	culimit: limit
	cutimecond: string
	cuxff: string
	cutoken: string
}

export interface ApiQueryCheckUserLogParams extends ApiQueryParams {
	culuser: string
	cultarget: string
	cullimit: limit
	culdir: 'newer' | 'older'
	culfrom: timestamp
	culto: timestamp
	culcontinue: string
}

export interface CirrusSearchApiQueryBuildDocumentParams extends ApiQueryParams {

}

export interface CirrusSearchApiQueryCompSuggestBuildDocParams extends ApiQueryParams {
	csbmethod: string
}

export interface CirrusSearchApiQueryCirrusDocParams extends ApiQueryParams {

}

export interface ApiQueryContentTranslationParams extends ApiQueryParams {
	translationid: string
	from: string
	to: string
	sourcetitle: string
	limit: limit
	offset: string
	type: 'draft' | 'published'
}

export interface ApiQueryContentTranslationCorporaParams extends ApiQueryParams {
	translationid: number
	striphtml: boolean
	types: ('mt' | 'source' | 'user')[]
}

export interface ApiQueryContentTranslationLanguageTrendParams extends ApiQueryParams {
	source: string
	target: string
	interval: 'month' | 'week'
}

export interface ApiQueryContentTranslationStatsParams extends ApiQueryParams {

}

export interface ApiQueryContentTranslationSuggestionsParams extends ApiQueryParams {
	from: string
	to: string
	listid: string
	limit: limit
	offset: string
	seed: number
}

export interface ApiQueryContributorsParams extends ApiQueryParams {
	pcgroup: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	pcexcludegroup: ('abusefilter' | 'abusefilter-helper' | 'accountcreator' | 'autoreviewer' | 'bot' | 'bureaucrat' | 'checkuser' | 'confirmed' | 'copyviobot' | 'eventcoordinator' | 'extendedconfirmed' | 'extendedmover' | 'filemover' | 'founder' | 'import' | 'interface-admin' | 'ipblock-exempt' | 'massmessage-sender' | 'oversight' | 'patroller' | 'researcher' | 'reviewer' | 'rollbacker' | 'steward' | 'sysop' | 'templateeditor' | 'transwiki')[]
	pcrights: ('abusefilter-hidden-log' | 'abusefilter-hide-log' | 'abusefilter-log' | 'abusefilter-log-detail' | 'abusefilter-log-private' | 'abusefilter-modify' | 'abusefilter-modify-global' | 'abusefilter-modify-restricted' | 'abusefilter-privatedetails' | 'abusefilter-privatedetails-log' | 'abusefilter-revert' | 'abusefilter-view' | 'abusefilter-view-private' | 'apihighlimits' | 'applychangetags' | 'autoconfirmed' | 'autocreateaccount' | 'autopatrol' | 'autoreview' | 'autoreviewrestore' | 'bigdelete' | 'block' | 'blockemail' | 'bot' | 'browsearchive' | 'centralauth-lock' | 'centralauth-merge' | 'centralauth-oversight' | 'centralauth-rename' | 'centralauth-unmerge' | 'centralauth-usermerge' | 'changetags' | 'checkuser' | 'checkuser-log' | 'collectionsaveascommunitypage' | 'collectionsaveasuserpage' | 'createaccount' | 'createpage' | 'createpagemainns' | 'createtalk' | 'delete' | 'delete-redirect' | 'deletechangetags' | 'deletedhistory' | 'deletedtext' | 'deletelogentry' | 'deleterevision' | 'edit' | 'editautoreviewprotected' | 'editcontentmodel' | 'editeditorprotected' | 'editextendedsemiprotected' | 'editinterface' | 'editmyoptions' | 'editmyprivateinfo' | 'editmyusercss' | 'editmyuserjs' | 'editmyuserjson' | 'editmyuserjsredirect' | 'editmywatchlist' | 'editprotected' | 'editsemiprotected' | 'editsitecss' | 'editsitejs' | 'editsitejson' | 'editusercss' | 'edituserjs' | 'edituserjson' | 'extendedconfirmed' | 'flow-create-board' | 'flow-delete' | 'flow-edit-post' | 'flow-hide' | 'flow-suppress' | 'gadgets-definition-edit' | 'gadgets-edit' | 'globalblock' | 'globalblock-exempt' | 'globalblock-whitelist' | 'globalgroupmembership' | 'globalgrouppermissions' | 'gwtoolset' | 'hideuser' | 'import' | 'importupload' | 'ipblock-exempt' | 'manage-all-push-subscriptions' | 'managechangetags' | 'markbotedits' | 'massmessage' | 'mergehistory' | 'minoredit' | 'move' | 'move-categorypages' | 'move-rootuserpages' | 'move-subpages' | 'movefile' | 'movestable' | 'mwoauthmanageconsumer' | 'mwoauthmanagemygrants' | 'mwoauthproposeconsumer' | 'mwoauthsuppress' | 'mwoauthupdateownconsumer' | 'mwoauthviewprivate' | 'mwoauthviewsuppressed' | 'newsletter-create' | 'newsletter-delete' | 'newsletter-manage' | 'newsletter-restore' | 'nominornewtalk' | 'noratelimit' | 'nuke' | 'oathauth-api-all' | 'oathauth-disable-for-user' | 'oathauth-enable' | 'oathauth-verify-user' | 'oathauth-view-log' | 'override-antispoof' | 'override-export-depth' | 'pagelang' | 'pagetriage-copyvio' | 'patrol' | 'patrolmarks' | 'protect' | 'purge' | 'read' | 'renameuser' | 'reupload' | 'reupload-own' | 'reupload-shared' | 'review' | 'rollback' | 'securepoll-create-poll' | 'sendemail' | 'setmentor' | 'siteadmin' | 'skipcaptcha' | 'spamblacklistlog' | 'stablesettings' | 'suppressionlog' | 'suppressredirect' | 'suppressrevision' | 'tboverride' | 'tboverride-account' | 'templateeditor' | 'titleblacklistlog' | 'torunblocked' | 'transcode-reset' | 'transcode-status' | 'unblockself' | 'undelete' | 'unreviewedpages' | 'unwatchedpages' | 'upload' | 'upload_by_url' | 'urlshortener-create-url' | 'urlshortener-manage-url' | 'urlshortener-view-log' | 'usermerge' | 'userrights' | 'userrights-interwiki' | 'validate' | 'viewdeletedfile' | 'viewmyprivateinfo' | 'viewmywatchlist' | 'viewsuppressed' | 'vipsscaler-test' | 'writeapi')[]
	pcexcluderights: ('abusefilter-hidden-log' | 'abusefilter-hide-log' | 'abusefilter-log' | 'abusefilter-log-detail' | 'abusefilter-log-private' | 'abusefilter-modify' | 'abusefilter-modify-global' | 'abusefilter-modify-restricted' | 'abusefilter-privatedetails' | 'abusefilter-privatedetails-log' | 'abusefilter-revert' | 'abusefilter-view' | 'abusefilter-view-private' | 'apihighlimits' | 'applychangetags' | 'autoconfirmed' | 'autocreateaccount' | 'autopatrol' | 'autoreview' | 'autoreviewrestore' | 'bigdelete' | 'block' | 'blockemail' | 'bot' | 'browsearchive' | 'centralauth-lock' | 'centralauth-merge' | 'centralauth-oversight' | 'centralauth-rename' | 'centralauth-unmerge' | 'centralauth-usermerge' | 'changetags' | 'checkuser' | 'checkuser-log' | 'collectionsaveascommunitypage' | 'collectionsaveasuserpage' | 'createaccount' | 'createpage' | 'createpagemainns' | 'createtalk' | 'delete' | 'delete-redirect' | 'deletechangetags' | 'deletedhistory' | 'deletedtext' | 'deletelogentry' | 'deleterevision' | 'edit' | 'editautoreviewprotected' | 'editcontentmodel' | 'editeditorprotected' | 'editextendedsemiprotected' | 'editinterface' | 'editmyoptions' | 'editmyprivateinfo' | 'editmyusercss' | 'editmyuserjs' | 'editmyuserjson' | 'editmyuserjsredirect' | 'editmywatchlist' | 'editprotected' | 'editsemiprotected' | 'editsitecss' | 'editsitejs' | 'editsitejson' | 'editusercss' | 'edituserjs' | 'edituserjson' | 'extendedconfirmed' | 'flow-create-board' | 'flow-delete' | 'flow-edit-post' | 'flow-hide' | 'flow-suppress' | 'gadgets-definition-edit' | 'gadgets-edit' | 'globalblock' | 'globalblock-exempt' | 'globalblock-whitelist' | 'globalgroupmembership' | 'globalgrouppermissions' | 'gwtoolset' | 'hideuser' | 'import' | 'importupload' | 'ipblock-exempt' | 'manage-all-push-subscriptions' | 'managechangetags' | 'markbotedits' | 'massmessage' | 'mergehistory' | 'minoredit' | 'move' | 'move-categorypages' | 'move-rootuserpages' | 'move-subpages' | 'movefile' | 'movestable' | 'mwoauthmanageconsumer' | 'mwoauthmanagemygrants' | 'mwoauthproposeconsumer' | 'mwoauthsuppress' | 'mwoauthupdateownconsumer' | 'mwoauthviewprivate' | 'mwoauthviewsuppressed' | 'newsletter-create' | 'newsletter-delete' | 'newsletter-manage' | 'newsletter-restore' | 'nominornewtalk' | 'noratelimit' | 'nuke' | 'oathauth-api-all' | 'oathauth-disable-for-user' | 'oathauth-enable' | 'oathauth-verify-user' | 'oathauth-view-log' | 'override-antispoof' | 'override-export-depth' | 'pagelang' | 'pagetriage-copyvio' | 'patrol' | 'patrolmarks' | 'protect' | 'purge' | 'read' | 'renameuser' | 'reupload' | 'reupload-own' | 'reupload-shared' | 'review' | 'rollback' | 'securepoll-create-poll' | 'sendemail' | 'setmentor' | 'siteadmin' | 'skipcaptcha' | 'spamblacklistlog' | 'stablesettings' | 'suppressionlog' | 'suppressredirect' | 'suppressrevision' | 'tboverride' | 'tboverride-account' | 'templateeditor' | 'titleblacklistlog' | 'torunblocked' | 'transcode-reset' | 'transcode-status' | 'unblockself' | 'undelete' | 'unreviewedpages' | 'unwatchedpages' | 'upload' | 'upload_by_url' | 'urlshortener-create-url' | 'urlshortener-manage-url' | 'urlshortener-view-log' | 'usermerge' | 'userrights' | 'userrights-interwiki' | 'validate' | 'viewdeletedfile' | 'viewmyprivateinfo' | 'viewmywatchlist' | 'viewsuppressed' | 'vipsscaler-test' | 'writeapi')[]
	pclimit: limit
	pccontinue: string
}

export interface GeoDataApiQueryCoordinatesParams extends ApiQueryParams {
	colimit: limit
	cocontinue: string
	coprop: ('country' | 'dim' | 'globe' | 'name' | 'region' | 'type')[]
	coprimary: 'all' | 'primary' | 'secondary'
	codistancefrompoint: string
	codistancefrompage: string
}

export interface ApiQueryDeletedTranslationsParams extends ApiQueryParams {
	dtafter: timestamp
	dtnamespace: namespace
}

export interface ApiQueryPublishedTranslationsParams extends ApiQueryParams {
	from: string
	to: string
	limit: limit
	offset: string
}

export interface ApiQueryTranslatorStatsParams extends ApiQueryParams {
	translator: string
}

export interface ApiQueryDeletedRevisionsParams extends ApiQueryParams {
	drvprop: ('comment' | 'content' | 'contentmodel' | 'flags' | 'ids' | 'parsedcomment' | 'roles' | 'sha1' | 'size' | 'slotsha1' | 'slotsize' | 'tags' | 'timestamp' | 'user' | 'userid' | 'parsetree')[]
	drvslots: ('main')[]
	drvlimit: limit
	drvexpandtemplates: boolean
	drvgeneratexml: boolean
	drvparse: boolean
	drvsection: string
	drvdiffto: string
	drvdifftotext: string
	drvdifftotextpst: boolean
	drvcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	drvstart: timestamp
	drvend: timestamp
	drvdir: 'newer' | 'older'
	drvtag: string
	drvuser: string
	drvexcludeuser: string
	drvcontinue: string
}

export interface ApiQueryDeletedrevsParams extends ApiQueryParams {
	drstart: timestamp
	drend: timestamp
	drdir: 'newer' | 'older'
	drfrom: string
	drto: string
	drprefix: string
	drunique: boolean
	drnamespace: namespace
	drtag: string
	druser: string
	drexcludeuser: string
	drprop: ('comment' | 'content' | 'len' | 'minor' | 'parentid' | 'parsedcomment' | 'revid' | 'sha1' | 'tags' | 'token' | 'user' | 'userid')[]
	drlimit: limit
	drcontinue: string
}

export interface WikibaseClientApiDescriptionParams extends ApiQueryParams {
	desccontinue: number
	descprefersource: 'central' | 'local'
}

export interface ApiQueryDuplicateFilesParams extends ApiQueryParams {
	dflimit: limit
	dfcontinue: string
	dfdir: 'ascending' | 'descending'
	dflocalonly: boolean
}

export interface ApiQueryBacklinksParams extends ApiQueryParams {
	eititle: string
	eipageid: number
	eicontinue: string
	einamespace: namespace | namespace[]
	eidir: 'ascending' | 'descending'
	eifilterredir: 'all' | 'nonredirects' | 'redirects'
	eilimit: limit
}

export interface ApiQueryExternalLinksParams extends ApiQueryParams {
	ellimit: limit
	elcontinue: string
	elprotocol: '' | 'bitcoin' | 'ftp' | 'ftps' | 'geo' | 'git' | 'gopher' | 'http' | 'https' | 'irc' | 'ircs' | 'magnet' | 'mailto' | 'mms' | 'news' | 'nntp' | 'redis' | 'sftp' | 'sip' | 'sips' | 'sms' | 'ssh' | 'svn' | 'tel' | 'telnet' | 'urn' | 'worldwind' | 'xmpp'
	elquery: string
	elexpandurl: boolean
}

export interface TextExtractsApiQueryExtractsParams extends ApiQueryParams {
	exchars: number
	exsentences: number
	exlimit: limit
	exintro: boolean
	explaintext: boolean
	exsectionformat: 'plain' | 'raw' | 'wiki'
	excontinue: number
}

export interface ApiQueryExtLinksUsageParams extends ApiQueryParams {
	euprop: ('ids' | 'title' | 'url')[]
	eucontinue: string
	euprotocol: '' | 'bitcoin' | 'ftp' | 'ftps' | 'geo' | 'git' | 'gopher' | 'http' | 'https' | 'irc' | 'ircs' | 'magnet' | 'mailto' | 'mms' | 'news' | 'nntp' | 'redis' | 'sftp' | 'sip' | 'sips' | 'sms' | 'ssh' | 'svn' | 'tel' | 'telnet' | 'urn' | 'worldwind' | 'xmpp'
	euquery: string
	eunamespace: namespace | namespace[]
	eulimit: limit
	euexpandurl: boolean
}

export interface ApiQueryFeatureUsageParams extends ApiQueryParams {
	afustart: timestamp
	afuend: timestamp
	afuagent: string
	afufeatures: string | string[]
}

export interface ApiQueryFilearchiveParams extends ApiQueryParams {
	fafrom: string
	fato: string
	faprefix: string
	fadir: 'ascending' | 'descending'
	fasha1: string
	fasha1base36: string
	faprop: ('archivename' | 'bitdepth' | 'description' | 'dimensions' | 'mediatype' | 'metadata' | 'mime' | 'parseddescription' | 'sha1' | 'size' | 'timestamp' | 'user')[]
	falimit: limit
	facontinue: string
}

export interface ApiQueryFileRepoInfoParams extends ApiQueryParams {
	friprop: ('canUpload' | 'descBaseUrl' | 'descriptionCacheExpiry' | 'displayname' | 'favicon' | 'fetchDescription' | 'initialCapital' | 'local' | 'name' | 'rootUrl' | 'scriptDirUrl' | 'thumbUrl' | 'url')[]
}

export interface ApiQueryBacklinkspropParams extends ApiQueryParams {
	fuprop: ('pageid' | 'redirect' | 'title')[]
	funamespace: namespace | namespace[]
	fushow: ('!redirect' | 'redirect')[]
	fulimit: limit
	fucontinue: string
}

export interface ApiQueryFlaggedParams extends ApiQueryParams {

}

export interface ApiQueryGadgetCategoriesParams extends ApiQueryParams {
	gcprop: ('members' | 'name' | 'title')[]
	gcnames: string | string[]
}

export interface ApiQueryGadgetsParams extends ApiQueryParams {
	gaprop: ('desc' | 'id' | 'metadata')[]
	gacategories: string | string[]
	gaids: string | string[]
	gaallowedonly: boolean
	gaenabledonly: boolean
}

export interface GeoDataApiQueryGeoSearchElasticParams extends ApiQueryParams {
	gscoord: string
	gspage: string
	gsbbox: string
	gsradius: number
	gsmaxdim: number
	gslimit: limit
	gsglobe: 'earth'
	gsnamespace: namespace | namespace[]
	gsprop: ('country' | 'dim' | 'globe' | 'name' | 'region' | 'type')[]
	gsprimary: 'all' | 'primary' | 'secondary'
	gsdebug: boolean
}

export interface GettingStartedApiGettingStartedGetPagesParams extends ApiQueryParams {
	gsgptaskname: string
	gsgpexcludedtitle: string
	gsgpcount: number
}

export interface ApiQueryGlobalAllUsersParams extends ApiQueryParams {
	agufrom: string
	aguto: string
	aguprefix: string
	agudir: 'ascending' | 'descending'
	agugroup: ('abusefilter-helper' | 'abusefilter-maintainer' | 'apihighlimits-requestor' | 'captcha-exempt' | 'founder' | 'global-bot' | 'global-deleter' | 'global-flow-create' | 'global-interface-editor' | 'global-ipblock-exempt' | 'global-rollbacker' | 'global-sysop' | 'new-wikis-importer' | 'oathauth-tester' | 'ombuds' | 'otrs-member' | 'recursive-export' | 'staff' | 'steward' | 'sysadmin' | 'wmf-ops-monitoring' | 'wmf-researcher')[]
	aguexcludegroup: ('abusefilter-helper' | 'abusefilter-maintainer' | 'apihighlimits-requestor' | 'captcha-exempt' | 'founder' | 'global-bot' | 'global-deleter' | 'global-flow-create' | 'global-interface-editor' | 'global-ipblock-exempt' | 'global-rollbacker' | 'global-sysop' | 'new-wikis-importer' | 'oathauth-tester' | 'ombuds' | 'otrs-member' | 'recursive-export' | 'staff' | 'steward' | 'sysadmin' | 'wmf-ops-monitoring' | 'wmf-researcher')[]
	aguprop: ('existslocally' | 'groups' | 'lockinfo')[]
	agulimit: limit
}

export interface ApiQueryGlobalBlocksParams extends ApiQueryParams {
	bgstart: timestamp
	bgend: timestamp
	bgdir: 'newer' | 'older'
	bgids: number | number[]
	bgaddresses: string | string[]
	bgip: string
	bglimit: limit
	bgprop: ('address' | 'by' | 'expiry' | 'id' | 'range' | 'reason' | 'timestamp')[]
}

export interface ApiQueryGlobalGroupsParams extends ApiQueryParams {
	ggpprop: ('rights')[]
}

export interface GlobalPreferencesApiQueryGlobalPreferencesParams extends ApiQueryParams {
	gprprop: ('localoverrides' | 'preferences')[]
}

export interface ApiQueryGlobalRenameStatusParams extends ApiQueryParams {
	grsuser: string
}

export interface ApiQueryGlobalUsageParams extends ApiQueryParams {
	guprop: ('namespace' | 'pageid' | 'url')[]
	gulimit: limit
	gunamespace: namespace | namespace[]
	gusite: ('aawiki' | 'aawikibooks' | 'aawiktionary' | 'abwiki' | 'abwiktionary' | 'acewiki' | 'advisorswiki' | 'advisorywiki' | 'adywiki' | 'afwiki' | 'afwikibooks' | 'afwikiquote' | 'afwiktionary' | 'akwiki' | 'akwikibooks' | 'akwiktionary' | 'alswiki' | 'alswikibooks' | 'alswikiquote' | 'alswiktionary' | 'amwiki' | 'amwikimedia' | 'amwikiquote' | 'amwiktionary' | 'angwiki' | 'angwikibooks' | 'angwikiquote' | 'angwikisource' | 'angwiktionary' | 'anwiki' | 'anwiktionary' | 'apiportalwiki' | 'arbcom_cswiki' | 'arbcom_dewiki' | 'arbcom_enwiki' | 'arbcom_fiwiki' | 'arbcom_nlwiki' | 'arbcom_ruwiki' | 'arcwiki' | 'arwiki' | 'arwikibooks' | 'arwikimedia' | 'arwikinews' | 'arwikiquote' | 'arwikisource' | 'arwikiversity' | 'arwiktionary' | 'arywiki' | 'arzwiki' | 'astwiki' | 'astwikibooks' | 'astwikiquote' | 'astwiktionary' | 'aswiki' | 'aswikibooks' | 'aswikisource' | 'aswiktionary' | 'atjwiki' | 'auditcomwiki' | 'avkwiki' | 'avwiki' | 'avwiktionary' | 'awawiki' | 'aywiki' | 'aywikibooks' | 'aywiktionary' | 'azbwiki' | 'azwiki' | 'azwikibooks' | 'azwikiquote' | 'azwikisource' | 'azwiktionary' | 'banwiki' | 'barwiki' | 'bat_smgwiki' | 'bawiki' | 'bawikibooks' | 'bclwiki' | 'bdwikimedia' | 'be_x_oldwiki' | 'betawikiversity' | 'bewiki' | 'bewikibooks' | 'bewikimedia' | 'bewikiquote' | 'bewikisource' | 'bewiktionary' | 'bgwiki' | 'bgwikibooks' | 'bgwikinews' | 'bgwikiquote' | 'bgwikisource' | 'bgwiktionary' | 'bhwiki' | 'bhwiktionary' | 'biwiki' | 'biwikibooks' | 'biwiktionary' | 'bjnwiki' | 'bmwiki' | 'bmwikibooks' | 'bmwikiquote' | 'bmwiktionary' | 'bnwiki' | 'bnwikibooks' | 'bnwikisource' | 'bnwikivoyage' | 'bnwiktionary' | 'boardgovcomwiki' | 'boardwiki' | 'bowiki' | 'bowikibooks' | 'bowiktionary' | 'bpywiki' | 'brwiki' | 'brwikimedia' | 'brwikiquote' | 'brwikisource' | 'brwiktionary' | 'bswiki' | 'bswikibooks' | 'bswikinews' | 'bswikiquote' | 'bswikisource' | 'bswiktionary' | 'bugwiki' | 'bxrwiki' | 'cawiki' | 'cawikibooks' | 'cawikimedia' | 'cawikinews' | 'cawikiquote' | 'cawikisource' | 'cawiktionary' | 'cbk_zamwiki' | 'cdowiki' | 'cebwiki' | 'cewiki' | 'chairwiki' | 'chapcomwiki' | 'checkuserwiki' | 'chowiki' | 'chrwiki' | 'chrwiktionary' | 'chwiki' | 'chwikibooks' | 'chwiktionary' | 'chywiki' | 'ckbwiki' | 'cnwikimedia' | 'collabwiki' | 'commonswiki' | 'cowiki' | 'cowikibooks' | 'cowikimedia' | 'cowikiquote' | 'cowiktionary' | 'crhwiki' | 'crwiki' | 'crwikiquote' | 'crwiktionary' | 'csbwiki' | 'csbwiktionary' | 'cswiki' | 'cswikibooks' | 'cswikinews' | 'cswikiquote' | 'cswikisource' | 'cswikiversity' | 'cswiktionary' | 'cuwiki' | 'cvwiki' | 'cvwikibooks' | 'cywiki' | 'cywikibooks' | 'cywikiquote' | 'cywikisource' | 'cywiktionary' | 'dawiki' | 'dawikibooks' | 'dawikiquote' | 'dawikisource' | 'dawiktionary' | 'dewiki' | 'dewikibooks' | 'dewikinews' | 'dewikiquote' | 'dewikisource' | 'dewikiversity' | 'dewikivoyage' | 'dewiktionary' | 'dinwiki' | 'diqwiki' | 'dkwikimedia' | 'donatewiki' | 'dsbwiki' | 'dtywiki' | 'dvwiki' | 'dvwiktionary' | 'dzwiki' | 'dzwiktionary' | 'ecwikimedia' | 'eewiki' | 'electcomwiki' | 'elwiki' | 'elwikibooks' | 'elwikinews' | 'elwikiquote' | 'elwikisource' | 'elwikiversity' | 'elwikivoyage' | 'elwiktionary' | 'emlwiki' | 'enwiki' | 'enwikibooks' | 'enwikinews' | 'enwikiquote' | 'enwikisource' | 'enwikiversity' | 'enwikivoyage' | 'enwiktionary' | 'eowiki' | 'eowikibooks' | 'eowikinews' | 'eowikiquote' | 'eowikisource' | 'eowiktionary' | 'eswiki' | 'eswikibooks' | 'eswikinews' | 'eswikiquote' | 'eswikisource' | 'eswikiversity' | 'eswikivoyage' | 'eswiktionary' | 'etwiki' | 'etwikibooks' | 'etwikimedia' | 'etwikiquote' | 'etwikisource' | 'etwiktionary' | 'euwiki' | 'euwikibooks' | 'euwikiquote' | 'euwikisource' | 'euwiktionary' | 'execwiki' | 'extwiki' | 'fawiki' | 'fawikibooks' | 'fawikinews' | 'fawikiquote' | 'fawikisource' | 'fawikivoyage' | 'fawiktionary' | 'fdcwiki' | 'ffwiki' | 'fiu_vrowiki' | 'fiwiki' | 'fiwikibooks' | 'fiwikimedia' | 'fiwikinews' | 'fiwikiquote' | 'fiwikisource' | 'fiwikiversity' | 'fiwikivoyage' | 'fiwiktionary' | 'fixcopyrightwiki' | 'fjwiki' | 'fjwiktionary' | 'foundationwiki' | 'fowiki' | 'fowikisource' | 'fowiktionary' | 'frpwiki' | 'frrwiki' | 'frwiki' | 'frwikibooks' | 'frwikinews' | 'frwikiquote' | 'frwikisource' | 'frwikiversity' | 'frwikivoyage' | 'frwiktionary' | 'furwiki' | 'fywiki' | 'fywikibooks' | 'fywiktionary' | 'gagwiki' | 'ganwiki' | 'gawiki' | 'gawikibooks' | 'gawikiquote' | 'gawiktionary' | 'gcrwiki' | 'gdwiki' | 'gdwiktionary' | 'gewikimedia' | 'glkwiki' | 'glwiki' | 'glwikibooks' | 'glwikiquote' | 'glwikisource' | 'glwiktionary' | 'gnwiki' | 'gnwikibooks' | 'gnwiktionary' | 'gomwiki' | 'gomwiktionary' | 'gorwiki' | 'gotwiki' | 'gotwikibooks' | 'grantswiki' | 'grwikimedia' | 'guwiki' | 'guwikibooks' | 'guwikiquote' | 'guwikisource' | 'guwiktionary' | 'gvwiki' | 'gvwiktionary' | 'hakwiki' | 'hawiki' | 'hawiktionary' | 'hawwiki' | 'hewiki' | 'hewikibooks' | 'hewikinews' | 'hewikiquote' | 'hewikisource' | 'hewikivoyage' | 'hewiktionary' | 'hifwiki' | 'hifwiktionary' | 'hiwiki' | 'hiwikibooks' | 'hiwikimedia' | 'hiwikiquote' | 'hiwikisource' | 'hiwikiversity' | 'hiwikivoyage' | 'hiwiktionary' | 'howiki' | 'hrwiki' | 'hrwikibooks' | 'hrwikiquote' | 'hrwikisource' | 'hrwiktionary' | 'hsbwiki' | 'hsbwiktionary' | 'htwiki' | 'htwikisource' | 'huwiki' | 'huwikibooks' | 'huwikinews' | 'huwikiquote' | 'huwikisource' | 'huwiktionary' | 'hywiki' | 'hywikibooks' | 'hywikiquote' | 'hywikisource' | 'hywiktionary' | 'hywwiki' | 'hzwiki' | 'iawiki' | 'iawikibooks' | 'iawiktionary' | 'id_internalwikimedia' | 'idwiki' | 'idwikibooks' | 'idwikimedia' | 'idwikiquote' | 'idwikisource' | 'idwiktionary' | 'iegcomwiki' | 'iewiki' | 'iewikibooks' | 'iewiktionary' | 'igwiki' | 'iiwiki' | 'ikwiki' | 'ikwiktionary' | 'ilowiki' | 'ilwikimedia' | 'incubatorwiki' | 'inhwiki' | 'internalwiki' | 'iowiki' | 'iowiktionary' | 'iswiki' | 'iswikibooks' | 'iswikiquote' | 'iswikisource' | 'iswiktionary' | 'itwiki' | 'itwikibooks' | 'itwikinews' | 'itwikiquote' | 'itwikisource' | 'itwikiversity' | 'itwikivoyage' | 'itwiktionary' | 'iuwiki' | 'iuwiktionary' | 'jamwiki' | 'jawiki' | 'jawikibooks' | 'jawikinews' | 'jawikiquote' | 'jawikisource' | 'jawikiversity' | 'jawikivoyage' | 'jawiktionary' | 'jbowiki' | 'jbowiktionary' | 'jvwiki' | 'jvwiktionary' | 'kaawiki' | 'kabwiki' | 'kawiki' | 'kawikibooks' | 'kawikiquote' | 'kawiktionary' | 'kbdwiki' | 'kbpwiki' | 'kgwiki' | 'kiwiki' | 'kjwiki' | 'kkwiki' | 'kkwikibooks' | 'kkwikiquote' | 'kkwiktionary' | 'klwiki' | 'klwiktionary' | 'kmwiki' | 'kmwikibooks' | 'kmwiktionary' | 'knwiki' | 'knwikibooks' | 'knwikiquote' | 'knwikisource' | 'knwiktionary' | 'koiwiki' | 'kowiki' | 'kowikibooks' | 'kowikinews' | 'kowikiquote' | 'kowikisource' | 'kowikiversity' | 'kowiktionary' | 'krcwiki' | 'krwiki' | 'krwikiquote' | 'kshwiki' | 'kswiki' | 'kswikibooks' | 'kswikiquote' | 'kswiktionary' | 'kuwiki' | 'kuwikibooks' | 'kuwikiquote' | 'kuwiktionary' | 'kvwiki' | 'kwwiki' | 'kwwikiquote' | 'kwwiktionary' | 'kywiki' | 'kywikibooks' | 'kywikiquote' | 'kywiktionary' | 'labswiki' | 'labtestwiki' | 'ladwiki' | 'lawiki' | 'lawikibooks' | 'lawikiquote' | 'lawikisource' | 'lawiktionary' | 'lbewiki' | 'lbwiki' | 'lbwikibooks' | 'lbwikiquote' | 'lbwiktionary' | 'legalteamwiki' | 'lezwiki' | 'lfnwiki' | 'lgwiki' | 'lijwiki' | 'lijwikisource' | 'liwiki' | 'liwikibooks' | 'liwikinews' | 'liwikiquote' | 'liwikisource' | 'liwiktionary' | 'lldwiki' | 'lmowiki' | 'lnwiki' | 'lnwikibooks' | 'lnwiktionary' | 'loginwiki' | 'lowiki' | 'lowiktionary' | 'lrcwiki' | 'ltgwiki' | 'ltwiki' | 'ltwikibooks' | 'ltwikiquote' | 'ltwikisource' | 'ltwiktionary' | 'lvwiki' | 'lvwikibooks' | 'lvwiktionary' | 'maiwiki' | 'maiwikimedia' | 'map_bmswiki' | 'mdfwiki' | 'mediawikiwiki' | 'metawiki' | 'mgwiki' | 'mgwikibooks' | 'mgwiktionary' | 'mhrwiki' | 'mhwiki' | 'mhwiktionary' | 'minwiki' | 'minwiktionary' | 'miwiki' | 'miwikibooks' | 'miwiktionary' | 'mkwiki' | 'mkwikibooks' | 'mkwikimedia' | 'mkwikisource' | 'mkwiktionary' | 'mlwiki' | 'mlwikibooks' | 'mlwikiquote' | 'mlwikisource' | 'mlwiktionary' | 'mnwiki' | 'mnwikibooks' | 'mnwiktionary' | 'mnwwiki' | 'movementroleswiki' | 'mowiki' | 'mowiktionary' | 'mrjwiki' | 'mrwiki' | 'mrwikibooks' | 'mrwikiquote' | 'mrwikisource' | 'mrwiktionary' | 'mswiki' | 'mswikibooks' | 'mswiktionary' | 'mtwiki' | 'mtwiktionary' | 'muswiki' | 'mwlwiki' | 'mxwikimedia' | 'myvwiki' | 'mywiki' | 'mywikibooks' | 'mywiktionary' | 'mznwiki' | 'nahwiki' | 'nahwikibooks' | 'nahwiktionary' | 'napwiki' | 'napwikisource' | 'nawiki' | 'nawikibooks' | 'nawikiquote' | 'nawiktionary' | 'nds_nlwiki' | 'ndswiki' | 'ndswikibooks' | 'ndswikiquote' | 'ndswiktionary' | 'newiki' | 'newikibooks' | 'newiktionary' | 'newwiki' | 'ngwiki' | 'ngwikimedia' | 'nlwiki' | 'nlwikibooks' | 'nlwikimedia' | 'nlwikinews' | 'nlwikiquote' | 'nlwikisource' | 'nlwikivoyage' | 'nlwiktionary' | 'nnwiki' | 'nnwikiquote' | 'nnwiktionary' | 'noboard_chapterswikimedia' | 'nostalgiawiki' | 'novwiki' | 'nowiki' | 'nowikibooks' | 'nowikimedia' | 'nowikinews' | 'nowikiquote' | 'nowikisource' | 'nowiktionary' | 'nqowiki' | 'nrmwiki' | 'nsowiki' | 'nvwiki' | 'nycwikimedia' | 'nywiki' | 'nzwikimedia' | 'ocwiki' | 'ocwikibooks' | 'ocwiktionary' | 'officewiki' | 'olowiki' | 'ombudsmenwiki' | 'omwiki' | 'omwiktionary' | 'orwiki' | 'orwikisource' | 'orwiktionary' | 'oswiki' | 'otrs_wikiwiki' | 'outreachwiki' | 'pa_uswikimedia' | 'pagwiki' | 'pamwiki' | 'papwiki' | 'pawiki' | 'pawikibooks' | 'pawikisource' | 'pawiktionary' | 'pcdwiki' | 'pdcwiki' | 'pflwiki' | 'pihwiki' | 'piwiki' | 'piwiktionary' | 'plwiki' | 'plwikibooks' | 'plwikimedia' | 'plwikinews' | 'plwikiquote' | 'plwikisource' | 'plwikivoyage' | 'plwiktionary' | 'pmswiki' | 'pmswikisource' | 'pnbwiki' | 'pnbwiktionary' | 'pntwiki' | 'projectcomwiki' | 'pswiki' | 'pswikibooks' | 'pswikivoyage' | 'pswiktionary' | 'ptwiki' | 'ptwikibooks' | 'ptwikimedia' | 'ptwikinews' | 'ptwikiquote' | 'ptwikisource' | 'ptwikiversity' | 'ptwikivoyage' | 'ptwiktionary' | 'punjabiwikimedia' | 'qualitywiki' | 'quwiki' | 'quwikibooks' | 'quwikiquote' | 'quwiktionary' | 'rmwiki' | 'rmwikibooks' | 'rmwiktionary' | 'rmywiki' | 'rnwiki' | 'rnwiktionary' | 'roa_rupwiki' | 'roa_rupwiktionary' | 'roa_tarawiki' | 'romdwikimedia' | 'rowiki' | 'rowikibooks' | 'rowikinews' | 'rowikiquote' | 'rowikisource' | 'rowikivoyage' | 'rowiktionary' | 'rswikimedia' | 'ruewiki' | 'ruwiki' | 'ruwikibooks' | 'ruwikimedia' | 'ruwikinews' | 'ruwikiquote' | 'ruwikisource' | 'ruwikiversity' | 'ruwikivoyage' | 'ruwiktionary' | 'rwwiki' | 'rwwiktionary' | 'sahwiki' | 'sahwikiquote' | 'sahwikisource' | 'satwiki' | 'sawiki' | 'sawikibooks' | 'sawikiquote' | 'sawikisource' | 'sawiktionary' | 'scnwiki' | 'scnwiktionary' | 'scowiki' | 'scwiki' | 'scwiktionary' | 'sdwiki' | 'sdwikinews' | 'sdwiktionary' | 'searchcomwiki' | 'sewiki' | 'sewikibooks' | 'sewikimedia' | 'sgwiki' | 'sgwiktionary' | 'shnwiki' | 'shnwiktionary' | 'shwiki' | 'shwiktionary' | 'shywiktionary' | 'simplewiki' | 'simplewikibooks' | 'simplewikiquote' | 'simplewiktionary' | 'siwiki' | 'siwikibooks' | 'siwiktionary' | 'skwiki' | 'skwikibooks' | 'skwikiquote' | 'skwikisource' | 'skwiktionary' | 'slwiki' | 'slwikibooks' | 'slwikiquote' | 'slwikisource' | 'slwikiversity' | 'slwiktionary' | 'smnwiki' | 'smwiki' | 'smwiktionary' | 'snwiki' | 'snwiktionary' | 'sourceswiki' | 'sowiki' | 'sowiktionary' | 'spcomwiki' | 'specieswiki' | 'sqwiki' | 'sqwikibooks' | 'sqwikinews' | 'sqwikiquote' | 'sqwiktionary' | 'srnwiki' | 'srwiki' | 'srwikibooks' | 'srwikinews' | 'srwikiquote' | 'srwikisource' | 'srwiktionary' | 'sswiki' | 'sswiktionary' | 'stewardwiki' | 'stqwiki' | 'strategywiki' | 'stwiki' | 'stwiktionary' | 'suwiki' | 'suwikibooks' | 'suwikiquote' | 'suwiktionary' | 'svwiki' | 'svwikibooks' | 'svwikinews' | 'svwikiquote' | 'svwikisource' | 'svwikiversity' | 'svwikivoyage' | 'svwiktionary' | 'swwiki' | 'swwikibooks' | 'swwiktionary' | 'sysop_itwiki' | 'szlwiki' | 'szywiki' | 'tawiki' | 'tawikibooks' | 'tawikinews' | 'tawikiquote' | 'tawikisource' | 'tawiktionary' | 'tcywiki' | 'techconductwiki' | 'tenwiki' | 'test2wiki' | 'testcommonswiki' | 'testwiki' | 'testwikidatawiki' | 'tetwiki' | 'tewiki' | 'tewikibooks' | 'tewikiquote' | 'tewikisource' | 'tewiktionary' | 'tgwiki' | 'tgwikibooks' | 'tgwiktionary' | 'thankyouwiki' | 'thwiki' | 'thwikibooks' | 'thwikinews' | 'thwikiquote' | 'thwikisource' | 'thwiktionary' | 'tiwiki' | 'tiwiktionary' | 'tkwiki' | 'tkwikibooks' | 'tkwikiquote' | 'tkwiktionary' | 'tlwiki' | 'tlwikibooks' | 'tlwiktionary' | 'tnwiki' | 'tnwiktionary' | 'towiki' | 'towiktionary' | 'tpiwiki' | 'tpiwiktionary' | 'transitionteamwiki' | 'trwiki' | 'trwikibooks' | 'trwikimedia' | 'trwikinews' | 'trwikiquote' | 'trwikisource' | 'trwiktionary' | 'tswiki' | 'tswiktionary' | 'ttwiki' | 'ttwikibooks' | 'ttwikiquote' | 'ttwiktionary' | 'tumwiki' | 'twwiki' | 'twwiktionary' | 'tyvwiki' | 'tywiki' | 'uawikimedia' | 'udmwiki' | 'ugwiki' | 'ugwikibooks' | 'ugwikiquote' | 'ugwiktionary' | 'ukwiki' | 'ukwikibooks' | 'ukwikimedia' | 'ukwikinews' | 'ukwikiquote' | 'ukwikisource' | 'ukwikivoyage' | 'ukwiktionary' | 'urwiki' | 'urwikibooks' | 'urwikiquote' | 'urwiktionary' | 'usabilitywiki' | 'uzwiki' | 'uzwikibooks' | 'uzwikiquote' | 'uzwiktionary' | 'vecwiki' | 'vecwikisource' | 'vecwiktionary' | 'vepwiki' | 'vewiki' | 'vewikimedia' | 'viwiki' | 'viwikibooks' | 'viwikiquote' | 'viwikisource' | 'viwikivoyage' | 'viwiktionary' | 'vlswiki' | 'votewiki' | 'vowiki' | 'vowikibooks' | 'vowikiquote' | 'vowiktionary' | 'warwiki' | 'wawiki' | 'wawikibooks' | 'wawiktionary' | 'wbwikimedia' | 'wg_enwiki' | 'wikidatawiki' | 'wikimania2005wiki' | 'wikimania2006wiki' | 'wikimania2007wiki' | 'wikimania2008wiki' | 'wikimania2009wiki' | 'wikimania2010wiki' | 'wikimania2011wiki' | 'wikimania2012wiki' | 'wikimania2013wiki' | 'wikimania2014wiki' | 'wikimania2015wiki' | 'wikimania2016wiki' | 'wikimania2017wiki' | 'wikimania2018wiki' | 'wikimaniateamwiki' | 'wikimaniawiki' | 'wowiki' | 'wowikiquote' | 'wowiktionary' | 'wuuwiki' | 'xalwiki' | 'xhwiki' | 'xhwikibooks' | 'xhwiktionary' | 'xmfwiki' | 'yiwiki' | 'yiwikisource' | 'yiwiktionary' | 'yowiki' | 'yowikibooks' | 'yowiktionary' | 'yuewiktionary' | 'zawiki' | 'zawikibooks' | 'zawikiquote' | 'zawiktionary' | 'zeawiki' | 'zerowiki' | 'zh_classicalwiki' | 'zh_min_nanwiki' | 'zh_min_nanwikibooks' | 'zh_min_nanwikiquote' | 'zh_min_nanwikisource' | 'zh_min_nanwiktionary' | 'zh_yuewiki' | 'zhwiki' | 'zhwikibooks' | 'zhwikinews' | 'zhwikiquote' | 'zhwikisource' | 'zhwikiversity' | 'zhwikivoyage' | 'zhwiktionary' | 'zuwiki' | 'zuwikibooks' | 'zuwiktionary')[]
	gucontinue: string
	gufilterlocal: boolean
}

export interface ApiQueryGlobalUserInfoParams extends ApiQueryParams {
	guiuser: string
	guiid: number
	guiprop: ('editcount' | 'groups' | 'merged' | 'rights' | 'unattached')[]
}

export interface ApiQueryImageInfoParams extends ApiQueryParams {
	iiprop: ('archivename' | 'badfile' | 'bitdepth' | 'canonicaltitle' | 'comment' | 'commonmetadata' | 'dimensions' | 'extmetadata' | 'mediatype' | 'metadata' | 'mime' | 'parsedcomment' | 'sha1' | 'size' | 'thumbmime' | 'timestamp' | 'uploadwarning' | 'url' | 'user' | 'userid')[]
	iilimit: limit
	iistart: timestamp
	iiend: timestamp
	iiurlwidth: number
	iiurlheight: number
	iimetadataversion: string
	iiextmetadatalanguage: string
	iiextmetadatamultilang: boolean
	iiextmetadatafilter: string | string[]
	iiurlparam: string
	iibadfilecontexttitle: string
	iicontinue: string
	iilocalonly: boolean
}

export interface ApiQueryImagesParams extends ApiQueryParams {
	imlimit: limit
	imcontinue: string
	imimages: string | string[]
	imdir: 'ascending' | 'descending'
}

export interface ApiQueryBacklinksParams extends ApiQueryParams {
	iutitle: string
	iupageid: number
	iucontinue: string
	iunamespace: namespace | namespace[]
	iudir: 'ascending' | 'descending'
	iufilterredir: 'all' | 'nonredirects' | 'redirects'
	iulimit: limit
	iuredirect: boolean
}

export interface ApiQueryInfoParams extends ApiQueryParams {
	inprop: ('displaytitle' | 'notificationtimestamp' | 'preload' | 'protection' | 'subjectid' | 'talkid' | 'url' | 'varianttitles' | 'visitingwatchers' | 'watched' | 'watchers' | 'readable')[]
	intestactions: string | string[]
	intestactionsdetail: 'boolean' | 'full' | 'quick'
	intoken: ('block' | 'delete' | 'edit' | 'email' | 'import' | 'move' | 'protect' | 'unblock' | 'watch')[]
	incontinue: string
}

export interface ApiQueryIWBacklinksParams extends ApiQueryParams {
	iwblprefix: string
	iwbltitle: string
	iwblcontinue: string
	iwbllimit: limit
	iwblprop: ('iwprefix' | 'iwtitle')[]
	iwbldir: 'ascending' | 'descending'
}

export interface ApiQueryIWLinksParams extends ApiQueryParams {
	iwprop: ('url')[]
	iwprefix: string
	iwtitle: string
	iwdir: 'ascending' | 'descending'
	iwlimit: limit
	iwcontinue: string
	iwurl: boolean
}

export interface ApiQueryLangBacklinksParams extends ApiQueryParams {
	lbllang: string
	lbltitle: string
	lblcontinue: string
	lbllimit: limit
	lblprop: ('lllang' | 'lltitle')[]
	lbldir: 'ascending' | 'descending'
}

export interface ApiQueryLangLinksParams extends ApiQueryParams {
	llprop: ('autonym' | 'langname' | 'url')[]
	lllang: string
	lltitle: string
	lldir: 'ascending' | 'descending'
	llinlanguagecode: string
	lllimit: limit
	llcontinue: string
	llurl: boolean
}

export interface ApiQueryLangLinksCountParams extends ApiQueryParams {

}

export interface ApiQueryLanguageinfoParams extends ApiQueryParams {
	liprop: ('autonym' | 'bcp47' | 'code' | 'dir' | 'fallbacks' | 'name' | 'variants')[]
	licode: string | string[]
	licontinue: string
}

export interface ApiQueryLinksParams extends ApiQueryParams {
	plnamespace: namespace | namespace[]
	pllimit: limit
	plcontinue: string
	pltitles: string | string[]
	pldir: 'ascending' | 'descending'
}

export interface ApiQueryBacklinkspropParams extends ApiQueryParams {
	lhprop: ('pageid' | 'redirect' | 'title')[]
	lhnamespace: namespace | namespace[]
	lhshow: ('!redirect' | 'redirect')[]
	lhlimit: limit
	lhcontinue: string
}

export interface MediaWikiLinterApiQueryLintErrorsParams extends ApiQueryParams {
	lntcategories: ('bogus-image-options' | 'deletable-table-tag' | 'fostered' | 'html5-misnesting' | 'misc-tidy-replacement-issues' | 'misnested-tag' | 'missing-end-tag' | 'multi-colon-escape' | 'multiline-html-table-in-list' | 'multiple-unclosed-formatting-tags' | 'obsolete-tag' | 'pwrap-bug-workaround' | 'self-closed-tag' | 'stripped-tag' | 'tidy-font-bug' | 'tidy-whitespace-bug' | 'unclosed-quotes-in-heading' | 'wikilink-in-extlink')[]
	lntlimit: limit
	lntnamespace: namespace | namespace[]
	lntpageid: number | number[]
	lnttitle: string
	lntfrom: number
}

export interface MediaWikiLinterApiQueryLinterStatsParams extends ApiQueryParams {

}

export interface ApiQueryLogEventsParams extends ApiQueryParams {
	leprop: ('comment' | 'details' | 'ids' | 'parsedcomment' | 'tags' | 'timestamp' | 'title' | 'type' | 'user' | 'userid')[]
	letype: '' | 'abusefilter' | 'abusefilterprivatedetails' | 'block' | 'contentmodel' | 'create' | 'delete' | 'gblblock' | 'gblrename' | 'gblrights' | 'globalauth' | 'import' | 'managetags' | 'massmessage' | 'merge' | 'move' | 'newusers' | 'oath' | 'pagetriage-copyvio' | 'pagetriage-curation' | 'pagetriage-deletion' | 'patrol' | 'protect' | 'renameuser' | 'review' | 'rights' | 'spamblacklist' | 'stable' | 'suppress' | 'tag' | 'thanks' | 'timedmediahandler' | 'titleblacklist' | 'upload' | 'urlshortener' | 'usermerge'
	leaction: 'abusefilter/create' | 'abusefilter/hit' | 'abusefilter/modify' | 'abusefilterprivatedetails/access' | 'block/block' | 'block/reblock' | 'block/unblock' | 'contentmodel/change' | 'contentmodel/new' | 'create/create' | 'delete/delete' | 'delete/delete_redir' | 'delete/delete_redir2' | 'delete/event' | 'delete/restore' | 'delete/revision' | 'gblblock/dwhitelist' | 'gblblock/gblock' | 'gblblock/gblock2' | 'gblblock/gunblock' | 'gblblock/modify' | 'gblblock/whitelist' | 'gblrename/merge' | 'gblrename/promote' | 'gblrename/rename' | 'gblrights/deleteset' | 'gblrights/groupperms' | 'gblrights/groupprms2' | 'gblrights/groupprms3' | 'gblrights/grouprename' | 'gblrights/newset' | 'gblrights/setchange' | 'gblrights/setnewtype' | 'gblrights/setrename' | 'gblrights/usergroups' | 'globalauth/delete' | 'globalauth/hide' | 'globalauth/lock' | 'globalauth/lockandhid' | 'globalauth/setstatus' | 'globalauth/unhide' | 'globalauth/unlock' | 'import/interwiki' | 'import/upload' | 'interwiki/*' | 'managetags/activate' | 'managetags/create' | 'managetags/deactivate' | 'managetags/delete' | 'massmessage/*' | 'massmessage/failure' | 'massmessage/send' | 'massmessage/skipbadns' | 'massmessage/skipnouser' | 'massmessage/skipoptout' | 'merge/merge' | 'move/move' | 'move/move_redir' | 'newusers/autocreate' | 'newusers/byemail' | 'newusers/create' | 'newusers/create2' | 'newusers/newusers' | 'oath/*' | 'pagetriage-copyvio/insert' | 'pagetriage-curation/delete' | 'pagetriage-curation/enqueue' | 'pagetriage-curation/reviewed' | 'pagetriage-curation/tag' | 'pagetriage-curation/unreviewed' | 'pagetriage-deletion/delete' | 'patrol/autopatrol' | 'patrol/patrol' | 'protect/modify' | 'protect/move_prot' | 'protect/protect' | 'protect/unprotect' | 'renameuser/renameuser' | 'review/approve' | 'review/approve-a' | 'review/approve-i' | 'review/approve-ia' | 'review/approve2' | 'review/approve2-a' | 'review/approve2-i' | 'review/approve2-ia' | 'review/unapprove' | 'review/unapprove2' | 'rights/autopromote' | 'rights/blockautopromote' | 'rights/erevoke' | 'rights/restoreautopromote' | 'rights/rights' | 'spamblacklist/*' | 'stable/config' | 'stable/modify' | 'stable/move_stable' | 'stable/reset' | 'suppress/block' | 'suppress/cadelete' | 'suppress/delete' | 'suppress/event' | 'suppress/hide-afl' | 'suppress/reblock' | 'suppress/revision' | 'suppress/setstatus' | 'suppress/unhide-afl' | 'tag/update' | 'thanks/*' | 'timedmediahandler/resettranscode' | 'titleblacklist/*' | 'upload/overwrite' | 'upload/revert' | 'upload/upload' | 'urlshortener/*' | 'usermerge/*'
	lestart: timestamp
	leend: timestamp
	ledir: 'newer' | 'older'
	leuser: string
	letitle: string
	lenamespace: namespace
	leprefix: string
	letag: string
	lelimit: limit
	lecontinue: string
}

export interface KartographerApiQueryMapDataParams extends ApiQueryParams {
	mpdgroups: string
	mpdlimit: limit
	mpdcontinue: number
}

export interface MediaWikiMassMessageApiApiQueryMMSitesParams extends ApiQueryParams {
	term: string
}

export interface MediaWikiExtensionsPageViewInfoApiQueryMostViewedParams extends ApiQueryParams {
	pvimmetric: 'pageviews'
	pvimlimit: limit
	pvimoffset: number
}

export interface ApiQueryMyStashedFilesParams extends ApiQueryParams {
	msfprop: ('size' | 'type')[]
	msflimit: limit
	msfcontinue: string
}

export interface ApiEchoNotificationsParams extends ApiQueryParams {
	notwikis: string | string[]
	notfilter: ('!read' | 'read')[]
	notprop: ('count' | 'list' | 'seenTime')[]
	notsections: ('alert' | 'message')[]
	notgroupbysection: boolean
	notformat: 'flyout' | 'html' | 'model' | 'special'
	notlimit: limit
	notcontinue: string
	notunreadfirst: boolean
	nottitles: string | string[]
	notbundle: boolean
	notalertcontinue: string
	notalertunreadfirst: boolean
	notmessagecontinue: string
	notmessageunreadfirst: boolean
	notcrosswikisummary: boolean
}

export interface MediaWikiExtensionOATHAuthApiModuleApiQueryOATHParams extends ApiQueryParams {
	oathuser: string
	oathreason: string
}

export interface ApiQueryOldreviewedpagesParams extends ApiQueryParams {
	orstart: timestamp
	orend: timestamp
	ordir: 'newer' | 'older'
	ormaxsize: number
	orfilterwatched: 'all' | 'watched'
	ornamespace: namespace | namespace[]
	orcategory: string
	orfilterredir: 'all' | 'nonredirects' | 'redirects'
	orlimit: limit
}

export interface ORESHooksApiApiQueryORESParams extends ApiQueryParams {

}

export interface MediaWikiExtensionPageAssessmentsApiApiQueryPageAssessmentsParams extends ApiQueryParams {
	pacontinue: string
	palimit: limit
	pasubprojects: boolean
}

export interface PageImagesApiQueryPageImagesParams extends ApiQueryParams {
	piprop: ('name' | 'original' | 'thumbnail')[]
	pithumbsize: number
	pilimit: limit
	pilicense: 'any' | 'free'
	picontinue: number
	pilangcode: string
}

export interface ApiQueryPagePropNamesParams extends ApiQueryParams {
	ppncontinue: string
	ppnlimit: limit
}

export interface ApiQueryPagePropsParams extends ApiQueryParams {
	ppcontinue: string
	ppprop: string | string[]
}

export interface ApiQueryPagesWithPropParams extends ApiQueryParams {
	pwppropname: string
	pwpprop: ('ids' | 'title' | 'value')[]
	pwpcontinue: string
	pwplimit: limit
	pwpdir: 'ascending' | 'descending'
}

export interface WikibaseClientApiPageTermsParams extends ApiQueryParams {
	wbptcontinue: number
	wbptterms: ('alias' | 'description' | 'label')[]
}

export interface MediaWikiExtensionsPageViewInfoApiQueryPageViewsParams extends ApiQueryParams {
	pvipmetric: 'pageviews'
	pvipdays: number
	pvipcontinue: string
}

export interface ApiQueryPrefixSearchParams extends ApiQueryParams {
	pssearch: string
	psnamespace: namespace | namespace[]
	pslimit: limit
	psoffset: number
	psprofile: 'classic' | 'engine_autoselect' | 'fast-fuzzy' | 'fuzzy' | 'normal' | 'strict'
}

export interface MediaWikiExtensionPageAssessmentsApiApiQueryProjectPagesParams extends ApiQueryParams {
	wppassessments: boolean
	wppprojects: string | string[]
	wpplimit: limit
	wppcontinue: string
}

export interface MediaWikiExtensionPageAssessmentsApiApiQueryProjectsParams extends ApiQueryParams {
	pjsubprojects: boolean
}

export interface ApiQueryProtectedTitlesParams extends ApiQueryParams {
	ptnamespace: namespace | namespace[]
	ptlevel: ('autoconfirmed' | 'extendedconfirmed' | 'sysop' | 'templateeditor')[]
	ptlimit: limit
	ptdir: 'newer' | 'older'
	ptstart: timestamp
	ptend: timestamp
	ptprop: ('comment' | 'expiry' | 'level' | 'parsedcomment' | 'timestamp' | 'user' | 'userid')[]
	ptcontinue: string
}

export interface ApiQueryQueryPageParams extends ApiQueryParams {
	qppage: 'Ancientpages' | 'BrokenRedirects' | 'Deadendpages' | 'DisambiguationPageLinks' | 'DisambiguationPages' | 'DoubleRedirects' | 'Fewestrevisions' | 'GadgetUsage' | 'GloballyWantedFiles' | 'ListDuplicatedFiles' | 'Listredirects' | 'Lonelypages' | 'Longpages' | 'MediaStatistics' | 'MostGloballyLinkedFiles' | 'Mostcategories' | 'Mostimages' | 'Mostinterwikis' | 'Mostlinked' | 'Mostlinkedcategories' | 'Mostlinkedtemplates' | 'Mostrevisions' | 'Shortpages' | 'Uncategorizedcategories' | 'Uncategorizedimages' | 'Uncategorizedpages' | 'Uncategorizedtemplates' | 'UnconnectedPages' | 'Unusedcategories' | 'Unusedimages' | 'Unusedtemplates' | 'Unwatchedpages' | 'Wantedcategories' | 'Wantedfiles' | 'Wantedpages' | 'Wantedtemplates' | 'Withoutinterwiki'
	qpoffset: number
	qplimit: limit
}

export interface ApiQueryRandomParams extends ApiQueryParams {
	rnnamespace: namespace | namespace[]
	rnfilterredir: 'all' | 'nonredirects' | 'redirects'
	rnredirect: boolean
	rnlimit: limit
	rncontinue: string
}

export interface MediaWikiExtensionsReadingListsApiApiQueryReadingListEntriesParams extends ApiQueryParams {
	rlelists: number | number[]
	rlechangedsince: timestamp
	rlesort: 'name' | 'updated'
	rledir: 'ascending' | 'descending'
	rlelimit: limit
	rlecontinue: string
}

export interface MediaWikiExtensionsReadingListsApiApiQueryReadingListsParams extends ApiQueryParams {
	rllist: number
	rlproject: string
	rltitle: string
	rlchangedsince: timestamp
	rlsort: 'name' | 'updated'
	rldir: 'ascending' | 'descending'
	rllimit: limit
	rlcontinue: string
}

export interface ApiQueryRecentChangesParams extends ApiQueryParams {
	rcstart: timestamp
	rcend: timestamp
	rcdir: 'newer' | 'older'
	rcnamespace: namespace | namespace[]
	rcuser: string
	rcexcludeuser: string
	rctag: string
	rcprop: ('comment' | 'flags' | 'ids' | 'loginfo' | 'oresscores' | 'parsedcomment' | 'patrolled' | 'redirect' | 'sha1' | 'sizes' | 'tags' | 'timestamp' | 'title' | 'user' | 'userid')[]
	rctoken: ('patrol')[]
	rcshow: ('!anon' | '!autopatrolled' | '!bot' | '!minor' | '!oresreview' | '!patrolled' | '!redirect' | 'anon' | 'autopatrolled' | 'bot' | 'minor' | 'oresreview' | 'patrolled' | 'redirect' | 'unpatrolled')[]
	rclimit: limit
	rctype: ('categorize' | 'edit' | 'external' | 'log' | 'new')[]
	rctoponly: boolean
	rctitle: string
	rccontinue: string
	rcgeneraterevisions: boolean
	rcslot: 'main'
}

export interface ApiQueryBacklinkspropParams extends ApiQueryParams {
	rdprop: ('fragment' | 'pageid' | 'title')[]
	rdnamespace: namespace | namespace[]
	rdshow: ('!fragment' | 'fragment')[]
	rdlimit: limit
	rdcontinue: string
}

export interface ApiQueryRevisionsParams extends ApiQueryParams {
	rvprop: ('comment' | 'content' | 'contentmodel' | 'flagged' | 'flags' | 'ids' | 'oresscores' | 'parsedcomment' | 'roles' | 'sha1' | 'size' | 'slotsha1' | 'slotsize' | 'tags' | 'timestamp' | 'user' | 'userid' | 'parsetree')[]
	rvslots: ('main')[]
	rvlimit: limit
	rvexpandtemplates: boolean
	rvgeneratexml: boolean
	rvparse: boolean
	rvsection: string
	rvdiffto: string
	rvdifftotext: string
	rvdifftotextpst: boolean
	rvcontentformat: 'application/json' | 'application/octet-stream' | 'application/unknown' | 'application/x-binary' | 'text/css' | 'text/javascript' | 'text/plain' | 'text/unknown' | 'text/x-wiki' | 'unknown/unknown'
	rvstartid: number
	rvendid: number
	rvstart: timestamp
	rvend: timestamp
	rvdir: 'newer' | 'older'
	rvuser: string
	rvexcludeuser: string
	rvtag: string
	rvtoken: ('rollback')[]
	rvcontinue: string
}

export interface ApiQuerySearchParams extends ApiQueryParams {
	srsearch: string
	srnamespace: namespace | namespace[]
	srlimit: limit
	sroffset: number
	srqiprofile: 'classic' | 'classic_noboostlinks' | 'empty' | 'engine_autoselect' | 'mlr-1024rs' | 'popular_inclinks' | 'popular_inclinks_pv' | 'wsum_inclinks' | 'wsum_inclinks_pv'
	srwhat: 'nearmatch' | 'text' | 'title'
	srinfo: ('rewrittenquery' | 'suggestion' | 'totalhits')[]
	srprop: ('categorysnippet' | 'extensiondata' | 'isfilematch' | 'redirectsnippet' | 'redirecttitle' | 'sectionsnippet' | 'sectiontitle' | 'size' | 'snippet' | 'timestamp' | 'titlesnippet' | 'wordcount' | 'hasrelated' | 'score')[]
	srinterwiki: boolean
	srenablerewrites: boolean
	srsort: 'create_timestamp_asc' | 'create_timestamp_desc' | 'incoming_links_asc' | 'incoming_links_desc' | 'just_match' | 'last_edit_asc' | 'last_edit_desc' | 'none' | 'random' | 'relevance'
}

export interface ApiQuerySiteinfoParams extends ApiQueryParams {
	siprop: ('dbrepllag' | 'defaultoptions' | 'extensions' | 'extensiontags' | 'fileextensions' | 'functionhooks' | 'general' | 'interwikimap' | 'languages' | 'languagevariants' | 'libraries' | 'magicwords' | 'namespacealiases' | 'namespaces' | 'protocols' | 'restrictions' | 'rightsinfo' | 'showhooks' | 'skins' | 'specialpagealiases' | 'statistics' | 'uploaddialog' | 'usergroups' | 'variables')[]
	sifilteriw: '!local' | 'local'
	sishowalldb: boolean
	sinumberingroup: boolean
	siinlanguagecode: string
}

export interface MediaWikiExtensionsPageViewInfoApiQuerySiteViewsParams extends ApiQueryParams {
	pvismetric: 'pageviews' | 'uniques'
	pvisdays: number
}

export interface ApiQueryStashImageInfoParams extends ApiQueryParams {
	siifilekey: string | string[]
	siisessionkey: string | string[]
	siiprop: ('badfile' | 'bitdepth' | 'canonicaltitle' | 'commonmetadata' | 'dimensions' | 'extmetadata' | 'metadata' | 'mime' | 'sha1' | 'size' | 'thumbmime' | 'timestamp' | 'url')[]
	siiurlwidth: number
	siiurlheight: number
	siiurlparam: string
}

export interface ApiQueryTagsParams extends ApiQueryParams {
	tgcontinue: string
	tglimit: limit
	tgprop: ('active' | 'defined' | 'description' | 'displayname' | 'hitcount' | 'source')[]
}

export interface ApiQueryLinksParams extends ApiQueryParams {
	tlnamespace: namespace | namespace[]
	tllimit: limit
	tlcontinue: string
	tltemplates: string | string[]
	tldir: 'ascending' | 'descending'
}

export interface ApiQueryTokensParams extends ApiQueryParams {
	type: ('createaccount' | 'csrf' | 'deleteglobalaccount' | 'login' | 'patrol' | 'rollback' | 'setglobalaccountstatus' | 'userrights' | 'watch')[]
}

export interface ApiQueryBacklinkspropParams extends ApiQueryParams {
	tiprop: ('pageid' | 'redirect' | 'title')[]
	tinamespace: namespace | namespace[]
	tishow: ('!redirect' | 'redirect')[]
	tilimit: limit
	ticontinue: string
}

export interface ApiTranscodeStatusParams extends ApiQueryParams {

}

export interface ApiEchoUnreadNotificationPagesParams extends ApiQueryParams {
	unpwikis: string | string[]
	unpgrouppages: boolean
	unplimit: limit
}

export interface ApiQueryUserContribsParams extends ApiQueryParams {
	uclimit: limit
	ucstart: timestamp
	ucend: timestamp
	uccontinue: string
	ucuser: string | string[]
	ucuserids: number | number[]
	ucuserprefix: string
	ucdir: 'newer' | 'older'
	ucnamespace: namespace | namespace[]
	ucprop: ('comment' | 'flags' | 'ids' | 'oresscores' | 'parsedcomment' | 'patrolled' | 'size' | 'sizediff' | 'tags' | 'timestamp' | 'title')[]
	ucshow: ('!autopatrolled' | '!minor' | '!new' | '!oresreview' | '!patrolled' | '!top' | 'autopatrolled' | 'minor' | 'new' | 'oresreview' | 'patrolled' | 'top')[]
	uctag: string
	uctoponly: boolean
}

export interface ApiQueryUserInfoParams extends ApiQueryParams {
	uiprop: ('acceptlang' | 'blockinfo' | 'centralids' | 'changeablegroups' | 'editcount' | 'email' | 'groupmemberships' | 'groups' | 'hasmsg' | 'implicitgroups' | 'latestcontrib' | 'options' | 'ratelimits' | 'realname' | 'registrationdate' | 'rights' | 'theoreticalratelimits' | 'unreadcount' | 'preferencestoken')[]
	uiattachedwiki: string
}

export interface ApiQueryUsersParams extends ApiQueryParams {
	usprop: ('blockinfo' | 'cancreate' | 'centralids' | 'editcount' | 'emailable' | 'gender' | 'groupmemberships' | 'groups' | 'implicitgroups' | 'registration' | 'rights')[]
	usattachedwiki: string
	ususers: string | string[]
	ususerids: number | number[]
	ustoken: ('userrights')[]
}

export interface ApiQueryVideoInfoParams extends ApiQueryParams {
	viprop: ('archivename' | 'badfile' | 'bitdepth' | 'canonicaltitle' | 'comment' | 'commonmetadata' | 'derivatives' | 'dimensions' | 'extmetadata' | 'mediatype' | 'metadata' | 'mime' | 'parsedcomment' | 'sha1' | 'size' | 'thumbmime' | 'timedtext' | 'timestamp' | 'uploadwarning' | 'url' | 'user' | 'userid')[]
	vilimit: limit
	vistart: timestamp
	viend: timestamp
	viurlwidth: number
	viurlheight: number
	vimetadataversion: string
	viextmetadatalanguage: string
	viextmetadatamultilang: boolean
	viextmetadatafilter: string | string[]
	viurlparam: string
	vibadfilecontexttitle: string
	vicontinue: string
	vilocalonly: string
}

export interface ApiQueryWatchlistParams extends ApiQueryParams {
	wlallrev: boolean
	wlstart: timestamp
	wlend: timestamp
	wlnamespace: namespace | namespace[]
	wluser: string
	wlexcludeuser: string
	wldir: 'newer' | 'older'
	wllimit: limit
	wlprop: ('comment' | 'flags' | 'ids' | 'loginfo' | 'notificationtimestamp' | 'oresscores' | 'parsedcomment' | 'patrol' | 'sizes' | 'tags' | 'timestamp' | 'title' | 'user' | 'userid')[]
	wlshow: ('!anon' | '!autopatrolled' | '!bot' | '!minor' | '!oresreview' | '!patrolled' | '!unread' | 'anon' | 'autopatrolled' | 'bot' | 'minor' | 'oresreview' | 'patrolled' | 'unread')[]
	wltype: ('categorize' | 'edit' | 'external' | 'log' | 'new')[]
	wlowner: string
	wltoken: string
	wlcontinue: string
}

export interface ApiQueryWatchlistRawParams extends ApiQueryParams {
	wrcontinue: string
	wrnamespace: namespace | namespace[]
	wrlimit: limit
	wrprop: ('changed')[]
	wrshow: ('!changed' | 'changed')[]
	wrowner: string
	wrtoken: string
	wrdir: 'ascending' | 'descending'
	wrfromtitle: string
	wrtotitle: string
}

export interface WikibaseClientApiApiPropsEntityUsageParams extends ApiQueryParams {
	wbeuprop: ('url')[]
	wbeuaspect: ('C' | 'D' | 'L' | 'O' | 'S' | 'T' | 'X')[]
	wbeuentities: string | string[]
	wbeulimit: limit
	wbeucontinue: string
}

export interface WikibaseClientApiApiListEntityUsageParams extends ApiQueryParams {
	wbeuprop: ('url')[]
	wbeuaspect: ('C' | 'D' | 'L' | 'O' | 'S' | 'T' | 'X')[]
	wbeuentities: string | string[]
	wbeulimit: limit
	wbeucontinue: string
}

export interface WikibaseClientApiApiClientInfoParams extends ApiQueryParams {
	wbprop: ('siteid' | 'url')[]
}

export interface ApiQueryWikiSetsParams extends ApiQueryParams {
	wsfrom: string
	wsprop: ('type' | 'wikisincluded' | 'wikisnotincluded')[]
	wslimit: limit
	wsorderbyname: boolean
}
