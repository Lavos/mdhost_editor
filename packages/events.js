__lib__.provide('events', ['util'], function(__) {
	var _doCallbacks = function _doCallbacks (pairs, args) {
		var safe_pairs = pairs.slice();
		var safe_args = args.slice();
		var counter = 0, limit = safe_pairs.length;

		while (counter < limit) {
			var current_pair = safe_pairs[counter];
			current_pair.callback.apply(current_pair.context, safe_args.slice(1));
			counter++;
		};
	};

	var Events = function Events () {
		this.subscriptions = {};
		this.oneshots = {};
	};

	Events.prototype.cancelSubscriptions = function cancelSubscriptions (eventname) {
		if (eventname && this.subscriptions.hasOwnProperty(eventname)) {
			this.subscriptions[eventname] = [];
		} else if (!eventname) {
			this.subscriptions = {};
		};
	};

	Events.prototype.once = function once (eventname, callback, context) {
		var self = this;

		function wrappedHandler () {
			callback.apply(self, arguments);
			self.off(eventname, wrappedHandler);
		};

		return self.on(eventname, wrappedHandler, context);
	};

	Events.prototype.on = function on (eventname, callback, context) {
		var events = eventname.split(' ');
		var callback = callback || function(){};
		var context = context || this;

		var event_counter = 0, event_limit = events.length;
		while (event_counter < event_limit) {
			var current_event = events[event_counter];

			// if this event is listed as a oneshot, and it's been fired (truthy value), run callback immediately
			if (this.oneshots[current_event]) {
				callback.apply(context, this.oneshots[current_event]);
				event_counter++;
				continue;
			};

			if (!this.subscriptions.hasOwnProperty(current_event)) {
				this.subscriptions[current_event] = [];
			};

			this.subscriptions[current_event].push({
				callback: callback,
				context: context
			});

			event_counter++;
		};

		return callback;
	};

	Events.prototype.off = function off (eventname, callback, context) {
		if (this.subscriptions.hasOwnProperty(eventname)) {
			var callbacks = this.subscriptions[eventname];

			var counter = callbacks.length;
			while (counter--) {
				var p = callbacks[counter];

				if (context && context !== p.context) {
					continue;
				};

				if (callback && callback !== p.callback) {
					continue;
				};

				this.subscriptions[eventname].splice(counter, 1);
			};
		};
	};

	Events.prototype.fire = function fire () {
		var args = Array.prototype.slice.call(arguments);
		args.splice(1, 0, this); // the firing object is always the first argument

		var eventname = args[0];

		if (this.subscriptions.hasOwnProperty('all')) {
			_doCallbacks(this.subscriptions['all'], ['all'].concat(args));
		};

		if (this.subscriptions.hasOwnProperty(eventname)) {
			_doCallbacks(this.subscriptions[eventname], args);

		};
	};

	Events.prototype.fireOneShot = function fireOneShot () {
		this.fire.apply(this, arguments);

		var args = Array.prototype.slice.call(arguments);
		args.splice(1, 0, this); // the firing object is always the first argument

		var eventname = args[0];
		this.oneshots[eventname] = args.slice(1);
	};

	return Events;
});
