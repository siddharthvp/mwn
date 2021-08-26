import { MwnTitle } from '../title';
import { mwn } from '../bot';

export interface Link {
	wikitext: string;
	target: MwnTitle;
}

export interface PageLink extends Link {
	displaytext: string;
}

export interface FileLink extends Link {
	props: string;
}

export interface CategoryLink extends Link {
	sortkey: string;
}

export function parseLinks(text: string, bot: mwn) {
	const links: PageLink[] = [];
	const files: FileLink[] = [];
	const categories: CategoryLink[] = [];

	let n = text.length;
	// files can have links in captions; use a stack to handle the nesting
	let stack = new Stack();
	for (let i = 0; i < n; i++) {
		if (text[i] === '[' && text[i + 1] === '[') {
			stack.push({
				startIdx: i,
			});
			i++;
		} else if (text[i] === ']' && text[i + 1] === ']' && stack.top()) {
			stack.top().endIdx = i + 1;
			let linktext = text.slice(stack.top().startIdx, stack.top().endIdx + 1);
			processLink(linktext, links, files, categories, bot);
			stack.pop();
			i++; // necessary to handle cases like [[File:ImageName|thumb|A [[hill]]]]
		}
	}

	return { links, files, categories };
}

function processLink(linktext: string, links: PageLink[], files: FileLink[], categories: CategoryLink[], bot: mwn) {
	let [target, displaytext] = linktext.slice(2, -2).split('|');
	let noSortkey = false;
	if (!displaytext) {
		displaytext = target[0] === ':' ? target.slice(1) : target;
		noSortkey = true;
	}
	let title = bot.title.newFromText(target);
	if (!title) {
		return;
	}
	if (target[0] !== ':') {
		if (title.namespace === 6) {
			files.push({
				wikitext: linktext,
				target: title,
				props: linktext.slice(linktext.indexOf('|') + 1, -2),
			});
			return;
		} else if (title.namespace === 14) {
			categories.push({
				wikitext: linktext,
				target: title,
				sortkey: noSortkey ? '' : displaytext,
			});
			return;
		}
	}
	links.push({
		wikitext: linktext,
		target: title,
		displaytext: displaytext,
	});
}

class Stack extends Array {
	top() {
		return this[this.length - 1];
	}
}
