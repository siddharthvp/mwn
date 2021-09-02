# Developing

Obtain the latest development copy:

```bash
git clone https://github.com/siddharthvp/mwn.git
cd mwn
npm install		# install dependencies
```

Build: run `npm run build`. This generates the JS files in `build` from the TypeScript sources in `src`. The type errors raised can be ignored. You may want to configure your IDE to do this automatically on every code change.

### Tests

Mwn has a comprehensive test suite that uses [mocha](https://www.npmjs.com/package/mocha) runner and [chai](https://www.npmjs.com/package/chai) for expectations. Tests should be added for all bug fixes and feature changes. There are three types of tests:

1. Tests that don't require a wiki: `npm run test:nowiki`
2. Tests that are based on [testwiki](https://test.wikipedia.org/): `npm run test:testwiki`

You need to setup botpassword login credentials for testwiki to run these tests. Create a `.auth.js` file in repository root, with this structure:

```json
{
  "username": "",
  "password": ""
}
```

No edits (or any other type of write action) will be done on testwiki. The credentials are only for reading content.

3. Tests that require a local wiki: `npm run test:localwiki`

For these, you need to spin up a local MediaWiki installation:

- Ensure that you have docker and docker-compose installed. If you're using Windows, you need to use WSL 2 and follow the steps at <https://docs.docker.com/desktop/windows/wsl/> to link Docker Desktop to WSL.
- Run `npm run setuplocalwiki`

If all goes well, you should now have a wiki up and running at [http://localhost:8080](http://localhost:8080). Sign in with username `Wikiuser` and password `wikipassword` (See [the setup.sh script](https://github.com/siddharthvp/mwn/blob/master/tests/docker/setup.sh) for other setup details.)

**Troubleshooting**: If your local MW install fails with an error that a db table doesn't exist, try changing the sleep duration in <https://github.com/siddharthvp/mwn/blob/master/tests/docker/main.sh#L2> to a higher value. The MariaDB database doesn't start accepting connections until it has initialised (time needed for that could be more on certain systems).

All tests except the ones that depend on testwiki will also be run automatically via GitHub Actions when you create a PR, so no worries if you're having trouble with local MW installation.

### Documentation

When adding new features, please also update the corresponding documentation in `website/docs`. Documentation can be previewed by running `npm run docs` which starts a server at [http://localhost:3000](http://localhost:3000) that updates the rendered docs live as they are edited.

The docs are hosted on <https://mwn.toolforge.org> and generated via [Docusaurus](https://docusaurus.io/). Build and deployment take place via GitHub Actions whenever they're updated in the master branch.
