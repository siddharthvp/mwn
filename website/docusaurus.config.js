/** @type {import("@docusaurus/types").DocusaurusConfig} */
module.exports = {
	title: 'Mwn',
	tagline: 'JavaScript & TypeScript bot framework for Node.js',
	url: 'https://mwn.toolforge.org',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'siddharthvp', // Usually your GitHub org/user name.
	projectName: 'mwn', // Usually your repo name.
	themeConfig: {
		navbar: {
			title: 'Mwn',
			logo: {
				alt: 'My Site Logo',
				src: 'img/logo.svg',
			},
			items: [
				{ to: '/', label: 'Home', position: 'right' },
				{ href: 'https://mwn.toolforge.org/docs/api', label: 'API Documentation', position: 'right' },
				{
					href: 'https://github.com/siddharthvp/mwn',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/siddharthvp/mwn/edit/master/website/',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
};
