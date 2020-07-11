const realCredentials = require('./.auth.json');

module.exports = {
	"valid": {
		"apiUrl": "https://test.wikipedia.org/w/api.php",
		"username": realCredentials.username,
		"password": realCredentials.password
	},
	"valid_oauth": {
		"apiUrl": "https://test.wikipedia.org/w/api.php",
		"OAuthCredentials": {
			consumerToken: realCredentials.oauth_consumer_token,
			consumerSecret: realCredentials.oauth_consumer_secret,
			accessToken: realCredentials.oauth_access_token,
			accessSecret: realCredentials.oauth_access_secret
		}
	},
	"invalid": {
		"apiUrl": "https://test.wikipedia.org/w/api.php",
		"username": "InvalidUserName",
		"password": "invalidPassword"
	},
	"invalidApiUrl": {
		"apiUrl": "http://google.de/wiki/api.php",
		"username": "InvalidUserName",
		"password": "invalidPassword"
	}
};