/**
 * Note: Unused.
 *
 * Script to bump the version before a release.
 * The last commit is amended to raise the version
 * number. The commit message of the last commit
 * is retained as is.
 *
 * Usage:
 * 	node bump-version.js or npm run bump
 * 	npm run bump major
 * 	npm run bump minor
 *	npm run bump patch
 */

const fs = require('fs');
const { exec } = require('child_process');

var packageJson = require('./package.json');
var versionNums = packageJson.version.split('.').map((n) => parseInt(n));

switch (process.argv[2]) {
	case 'major':
		versionNums[0]++;
		versionNums[1] = 0;
		versionNums[2] = 0;
		break;
	case 'minor':
		versionNums[1]++;
		versionNums[2] = 0;
		break;
	case 'patch':
		versionNums[2]++;
		break;
	default:
		console.log(`[E] version increment type not specified`);
		process.exit(1);
}

packageJson.version = versionNums.join('.');

exec('git diff --name-only | grep package.json', (err, stdout) => {
	if (stdout.trim()) {
		console.log(
			`[E] There are unstaged changes to package.json. Please stage or commit or stash these changes first`,
		);
		process.exit(1);
	}

	fs.writeFileSync('./package.json', JSON.stringify(packageJson, undefined, 2), console.log);

	exec('git add package.json; git commit --amend --no-edit', (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Successfully bumped version number to ${packageJson.version}`);
		}
	});
});
