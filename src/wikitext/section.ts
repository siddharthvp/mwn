export interface Section {
	level: number;
	header: string;
	index: number;
	content?: string;
}

/** See {@link MwnWikitext.parseSections} */
export function parseSections(text: string): Section[] {
	const rgx = /^(=+)(.*?)\1/gm;
	let sections: Section[] = [
		{
			level: 1,
			header: null,
			index: 0,
		},
	];
	let match;
	while ((match = rgx.exec(text))) {
		// eslint-disable-line no-cond-assign
		sections.push({
			level: match[1].length,
			header: match[2].trim(),
			index: match.index,
		});
	}
	let n = sections.length;
	for (let i = 0; i < n - 1; i++) {
		sections[i].content = text.slice(sections[i].index, sections[i + 1].index);
	}
	sections[n - 1].content = text.slice(sections[n - 1].index);
	return sections;
}
