const realCredentials = process.env.AUTH_JSON ? JSON.parse(process.env.AUTH_JSON) : require('./.auth.json');

module.exports = {
	account1: {
		apiUrl: 'https://test.wikipedia.org/w/api.php',
		username: realCredentials.username,
		password: realCredentials.password,
	},
	account2: {
		apiUrl: 'https://test.wikipedia.org/w/api.php',
		username: realCredentials.username2,
		password: realCredentials.password2,
	},
	account1_oauth2: {
		apiUrl: 'https://test.wikipedia.org/w/api.php',
		OAuth2AccessToken: realCredentials.oauth2_access_token,
	},
	account1_oauth: {
		apiUrl: 'https://test.wikipedia.org/w/api.php',
		OAuthCredentials: {
			consumerToken: realCredentials.oauth_consumer_token,
			consumerSecret: realCredentials.oauth_consumer_secret,
			accessToken: realCredentials.oauth_access_token,
			accessSecret: realCredentials.oauth_access_secret,
		},
	},
	invalid: {
		apiUrl: 'https://test.wikipedia.org/w/api.php',
		username: 'InvalidUserName',
		password: 'invalidPassword',
	},
	invalidApiUrl: {
		apiUrl: 'http://google.de/wiki/api.php',
		username: 'InvalidUserName',
		password: 'invalidPassword',
	},
};
