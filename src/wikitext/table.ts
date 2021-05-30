export class ElementWithAttributes {
	attrs: Map<string, string> = new Map<string, string>();
	classes: Set<string> = new Set<string>();
	styles: Map<string, string> = new Map<string, string>();

	addClass(cls: string) {
		this.classes.add(cls);
	}

	removeClass(cls: string) {
		this.classes.delete(cls);
		this.styles.delete(cls);
	}

	setClasses(classes: string[]) {
		this.classes = new Set(classes);
	}

	setStyle(name: string, value: string) {
		this.styles.set(name, value);
	}

	setStyles(styles: Record<string, string>) {
		Object.entries(styles).forEach(([name, value]) => this.setStyle(name, value));
	}

	setStylesAsString(styleStr: string) {
		this.setStyles(this.parseStylesFromString(styleStr));
	}

	setAttribute(name: 'class', value: string | string[]): void;

	setAttribute(name: 'style', value: string | Record<string, string>): void;

	setAttribute(name: string, value: string): void;

	setAttribute(name: string, value: any): void {
		// cover special cases of class and style here?
		if (Array.isArray(value) && name === 'class') {
			value.forEach((cls) => this.addClass(cls));
		} else if (typeof value === 'object' && name === 'style') {
			Object.entries(value).forEach(([name, value]) => {
				this.setStyle(name, value);
			});
		}
		this.attrs.set(name, value);
	}

	setAttributes(attributes: Record<string, string>) {
		Object.entries(attributes).forEach(([name, value]) => this.setAttribute(name, value));
	}

	attributesToText() {
		if (this.attrs.get('class')) {
			// classes specified in attributes
			for (let cls of this.attrs
				.get('class')
				.split(' ')
				.map((e) => e.trim())) {
				this.addClass(cls);
			}
		}
		this.attrs.set('class', [...this.classes].join(' '));
		this.attrs.set(
			'style',
			Object.entries(this.parseStylesFromString(this.attrs.get('style')))
				.concat([...this.styles.entries()])
				.map(([name, value]) => `${name}: ${value};`)
				.join(' '),
		);
		return [...this.attrs.entries()]
			.filter(([, value]) => !!value)
			.map(([name, value]) => `${name}="${value}"`)
			.join(' ');
	}

	private parseStylesFromString(styleStr: string): Record<string, string> {
		if (!styleStr) return {};
		return styleStr.split(';').reduce((accu, cur) => {
			let [name, value] = cur.split(':').map((e) => e.trim());
			accu[name] = value;
			return accu;
		}, {} as Record<string, string>);
	}
}

export interface TableConfig {
	plain?: boolean;
	sortable?: boolean;
	classes?: string[];
	attributes?: Record<string, string>;
	style?: Record<string, string> | string;
	data?: Array<Record<string, string>>;
}

export class Table extends ElementWithAttributes {
	headers: TableHeader[] = [];
	rows: TableRow[] = [];
	caption: TableCaption;

	constructor(config: TableConfig = {}) {
		super();
		if (config.data) {
			Table.createFromData(this, config.data);
		}
		this.setClasses(config.classes);
		if (!config.plain) {
			this.addClass('wikitable');
		}
		if (config.sortable !== false) {
			this.addClass('sortable');
		}
		if (typeof config.style === 'string') {
			this.setStylesAsString(config.style);
		} else if (config.style) {
			this.setStyles(config.style);
		}
		if (config.attributes) {
			this.setAttributes(config.attributes);
		}
	}

	static fromText(text: string) {
		let data = parseTable(text);
		return this.fromData(data);
	}

	static fromData(data: Array<Record<string, string>>) {
		return this.createFromData(new Table(), data);
	}

	private static createFromData(table: Table, data: Array<Record<string, string>>) {
		let firstRow = data[0];
		Object.keys(firstRow).forEach((key, idx) => {
			table.headers.push(new TableHeader(key, table, idx));
		});
		for (let row of data) {
			table.rows.push(TableRow.fromObject(row));
		}
		return table;
	}

	addRow(values: string[]) {
		this.rows.push(new TableRow(values));
	}

	setHeaders(headers: (string | { [attribute: string]: string })[]) {
		this.headers = [];
		headers.forEach((item, idx) => {
			let label = typeof item === 'string' ? item : item.label;
			let header = new TableHeader(label, this, idx);
			if (typeof item !== 'string') {
				delete item.label;
				header.setAttributes(item);
			}
			this.headers.push(header);
		});
	}

	data() {
		let data: Array<Record<string, string>> = [];
		for (let row of this.rows) {
			data.push(row.toObject(this.headers));
		}
		return data;
	}

	toText() {
		return (
			'{| ' +
			this.attributesToText() +
			'\n' +
			'|-' +
			'\n' +
			(this.caption?.toText() || '') +
			this.headers.map((c) => c.toText()).join('\n') +
			'\n' +
			this.rows.map((r) => r.toText()).join('\n') +
			'\n' +
			'|}'
		);
	}

	addColumn(header: string, values?: string[], index?: number) {
		index = index ?? this.headers.length;
		this.headers.push(new TableHeader(header, this, index));
		this.rows = this.rows.map((row, idx) => {
			let newCells = row.cells;
			newCells.splice(index, 0, new TableCell(values[idx]));
			row.cells = newCells;
			return row;
		});
	}

	transformColumn(columnIdx: number, transformer: (cell: string) => string) {
		this.rows = this.rows.map((row) => {
			row.cells[columnIdx].content = transformer(row.cells[columnIdx].content);
			return row;
		});
	}

	setCaption(text: string, attributes: Record<string, string> = {}) {
		this.caption = new TableCaption(text, attributes);
	}
}

export class TableCaption extends ElementWithAttributes {
	text: string;

	constructor(text: string, attributes: Record<string, string> = {}) {
		super();
		this.text = text;
		this.setAttributes(attributes);
	}

	toText() {
		return this.text ? `|+ ${this.attributesToText()} | ${this.text}\n` : '';
	}
}

export class TableHeader extends ElementWithAttributes {
	label: string;
	table: Table;
	index: number;

	constructor(label: string, table: Table, index: number) {
		super();
		Object.assign(this, { label, table, index });
		this.attrs.set('scope', 'col');
	}

	values() {
		return this.table.rows.map((row) => row.cells[this.index].content);
	}

	toText() {
		return '! ' + this.attributesToText() + ' | ' + this.label;
	}
}

export class TableRow extends ElementWithAttributes {
	cells: TableCell[];

	constructor(values?: string[]) {
		super();
		this.cells = values.map((e) => new TableCell(e));
	}

	static fromObject(row: Record<string, string>) {
		return new TableRow(Object.values(row));
	}

	values() {
		return this.cells.map((cell) => cell.content);
	}

	toObject(columns: TableHeader[]): Record<string, string> {
		let obj: Record<string, string> = {};
		this.cells.forEach((cell, idx) => {
			obj[columns[idx].label] = cell.content;
		});
		return obj;
	}

	toText() {
		return '|- ' + this.attributesToText() + '\n' + this.cells.map((c) => '| ' + c.content).join('\n');
	}
}

export class TableCell extends ElementWithAttributes {
	content: string;

	constructor(text: string) {
		super();
		this.content = text;
	}
}

export class Attribute {
	name: string;
	value: string;

	constructor(name: string, value: string) {
		Object.assign(this, { name, value });
	}

	toText() {
		return `${this.name}="${this.value}"`;
	}
}

export class ClassAttribute extends Attribute {
	readonly name = 'class';
	classes: Set<string> = new Set<string>();

	add(cls: string) {
		this.classes.add(cls);
		this.value = [...this.classes].join(' ');
	}

	remove(cls: string) {
		this.classes.delete(cls);
		this.value = [...this.classes].join(' ');
	}
}

export class StyleAttribute extends Attribute {
	readonly name = 'style';
	styles: Map<string, string> = new Map<string, string>();

	add(name: string, value: string) {
		this.styles.set(name, value);
		this.value = [...this.styles.entries()]
			.map(([key, value]) => {
				return `${key}: ${value};`;
			})
			.join(' ');
	}
}

/** See {@link MwnWikitextStatic.parseTable} */
export function parseTable(text: string): { [column: string]: string }[] {
	text = text.trim();
	if (!text.startsWith('{|') || !text.endsWith('|}')) {
		throw new Error('failed to parse table. Unexpected starting or ending');
	}
	// remove front matter and final matter
	// including table attributes and caption, and unnecessary |- at the top
	text = text.replace(/^\{\|.*$((\n\|-)?\n\|\+.*$)?(\n\|-)?/m, '').replace(/^\|\}$/m, '');

	let [header, ...rows] = text.split(/^\|-/m).map((r) => r.trim());

	// remove cell attributes, extracts data
	const extractData = (cell: string) => {
		return cell.slice(indexOfRawPipe(cell) + 1).trim();
	};

	// XXX: handle the case where there is no header row
	let cols = header.split('\n').map((e) => e.replace(/^!/, ''));

	if (cols.length === 1) {
		// non-multilined table?
		cols = cols[0].split('!!');
	}
	cols = cols.map(extractData);

	let numcols = cols.length;

	let output = new Array(rows.length);

	rows.forEach((row, idx) => {
		let cells = row.split(/^\|/m).slice(1); // slice(1) removes the emptiness or the row styles if present

		if (cells.length === 1) {
			// non-multilined
			// cells are separated by ||
			cells = cells[0].replace(/^\|/, '').split('||');
		}

		cells = cells.map(extractData);

		if (cells.length !== numcols) {
			throw new Error(`failed to parse table: found ${cells.length} cells on row ${idx}, expected ${numcols}`);
		}

		output[idx] = {}; // output[idx] represents a row
		for (let i = 0; i < numcols; i++) {
			output[idx][cols[i]] = cells[i];
		}
	});

	return output;
}

function indexOfRawPipe(text: string) {
	// number of unclosed brackets
	let tlevel = 0,
		llevel = 0;

	let n = text.length;
	for (let i = 0; i < n; i++) {
		if (text[i] === '{' && text[i + 1] === '{') {
			tlevel++;
			i++;
		} else if (text[i] === '[' && text[i + 1] === '[') {
			llevel++;
			i++;
		} else if (text[i] === '}' && text[i + 1] === '}') {
			tlevel--;
			i++;
		} else if (text[i] === ']' && text[i + 1] === ']') {
			llevel--;
			i++;
		} else if (text[i] === '|' && tlevel === 0 && llevel === 0) {
			return i;
		}
	}
}
