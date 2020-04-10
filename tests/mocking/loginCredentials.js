const realCredentials = require('./.auth.json');

module.exports = {
	"valid": {
		"apiUrl": "https://test.wikipedia.org/w/api.php",
		"username": realCredentials.username,
		"password": realCredentials.password
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