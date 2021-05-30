const { expect } = require('./test_wiki');
const { ElementWithAttributes, Table, TableRow, TableCell, TableHeader, TableCaption } = require('../build/wikitext/table');

describe('table', function () {
	it('element classes', () => {
		let element = new ElementWithAttributes();
		element.setAttributes({
			scope: 'col',
			class: 'class1'
		});
		element.setClasses(['class2', 'class3']);
		expect(element.attributesToText()).to.equal('scope="col" class="class2 class3 class1"');
	});

	it('element styles', () => {
		let element = new ElementWithAttributes();
		element.setAttributes({
			scope: 'col',
			style: 'width: 4em'
		});
		element.setClasses(['class1', 'class2']);
		element.setStyle('padding', '0');
		expect(element.attributesToText()).to.equal('scope="col" style="width: 4em; padding: 0;" class="class1 class2"');
	});

	it('table', () => {
		var table = new Table();
		table.setHeaders(['Header text', 'Header text', 'Header text']);
		table.addRow(['Example', 'Example', 'Example']);
		table.addRow(['Example', 'Example', 'Example']);
		expect(table.toText()).toMatchSnapshot();

		table.transformColumn(1, text => text + ' ' + text);
		expect(table.toText()).toMatchSnapshot();

		table.addColumn('New column', ['c1', 'c2'], 2);
		expect(table.toText()).toMatchSnapshot();
	});

	it('table from text', () => {

	});
});
