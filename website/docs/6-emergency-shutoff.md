# Emergency shutoff

Mwn exploits Node's asynchronous event loop to efficiently implement emergency shutoff.

```js
bot.enableEmergencyShutoff({
	// The name of the page to check
	page: 'User:ExampleBot/shutoff',

	// check shutoff page every 5 seconds
	intervalDuration: 5000,
	
	// function to determine whether the bot should continue to run or not
	condition: function (pagetext) {
		// Example implementation: if some one changes the text to something
		// other than "running", let's decide to stop!
		if (pagetext !== 'running') {
			return false; 
		} else return true;
	},
	
	// function to trigger when shutoff is activated
	onShutoff: function (pagetext) {
		// let's just exit, though we could also terminate
		// any open connections, close files, etc.
		process.exit(); 
	}
});
```

The rate of shutoff checks is not impacted by your actual editing rate, as it takes place separately in a setInterval() loop. Caution: this implementation has not been stress-tested.

Shutoff once enabled can be disabled anytime, such as when you stop performing write operations and you're now just doing read operations.

```js
bot.disableEmergencyShutoff();
```
