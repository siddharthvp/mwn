// Attribution: https://en.wikipedia.org/wiki/MediaWiki:Gadget-morebits.js (cc-by-sa 3.0/GFDL)
export class Unbinder {
	text: string;

	constructor(text: string) {
		this.text = text;
	}

	private unbinder: {
		counter: number;
		history: {
			[replaced: string]: string;
		};
		prefix: string;
		postfix: string;
	};

	/**
	 * Temporarily hide a part of the string while processing the rest of it.
	 *
	 * eg.  let u = new bot.wikitext("Hello world <!-- world --> world");
	 *      u.unbind('<!--','-->');
	 *      u.content = u.content.replace(/world/g, 'earth');
	 *      u.rebind(); // gives "Hello earth <!-- world --> earth"
	 *
	 * Text within the 'unbinded' part (in this case, the HTML comment) remains intact
	 * unbind() can be called multiple times to unbind multiple parts of the string.
	 *
	 * @param {string} prefix
	 * @param {string} postfix
	 */
	unbind(prefix: string, postfix: string): void {
		if (!this.unbinder) {
			this.unbinder = {
				counter: 0,
				history: {},
				prefix: '%UNIQ::' + Math.random() + '::',
				postfix: '::UNIQ%',
			};
		}
		let re = new RegExp(prefix + '([\\s\\S]*?)' + postfix, 'g');
		this.text = this.text.replace(re, (match) => {
			let current = this.unbinder.prefix + this.unbinder.counter + this.unbinder.postfix;
			this.unbinder.history[current] = match;
			++this.unbinder.counter;
			return current;
		});
	}

	/**
	 * Rebind after unbinding.
	 */
	rebind(): string {
		let content = this.text;
		for (let [current, replacement] of Object.entries(this.unbinder.history)) {
			content = content.replace(current, replacement);
		}
		this.text = content;
		return this.text;
	}

	/** Get the updated text */
	getText(): string {
		return this.text;
	}
}
