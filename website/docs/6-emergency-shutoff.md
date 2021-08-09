# Emergency shutoff

Mwn exploits Node's asynchronous event loop to efficiently implement emergency shutoff.

```js
bot.enableEmergencyShutoff({
	page: 'User:ExampleBot/shutoff', // The name of the page to check
	intervalDuration: 5000, // check shutoff page every 5 seconds
	condition: function (pagetext) {
		// function to determine whether the bot should continue to run or not
		if (pagetext !== 'running') {
			// Example implementation: if some one changes the text to something
			return false; // other than "running", let's decide to stop!
		} else return true;
	},
	onShutoff: function (pagetext) {
		// function to trigger when shutoff is activated
		process.exit(); // let's just exit, though we could also terminate
	} // any open connections, close files, etc.
});
```

The rate of shutoff checks is not impacted by your actual editing rate, as it takes place separately in a setInterval() loop. Caution: this implementation has not been stress-tested.

Shutoff once enabled can be disabled anytime, such as when you stop performing write operations and you're now just doing read operations.

```js
bot.disableEmergencyShutoff();
```
