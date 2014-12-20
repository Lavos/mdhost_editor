__lib__.provide('util', ['sprintf'], function(s){
	var __ = {};

	__.parseJSON = function(blob){
		var obj = false;

		try {
			obj = JSON.parse(blob);
		} catch (e) {
			// parse error
		};

		return obj;
	};

	__.isValidGUID = (function(){
		var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		return function(str){
			return regex.test(str);
		}
	})();

	__.insertiFrame = function insertiFrame (src) {
  		var iframe = document.createElement('iframe'), s = window.top.document.getElementsByTagName('script')[0];
		iframe.frameborder = "0";
		iframe.height = "0px";
		iframe.width = "0px";
		iframe.seamless = "seamless";
		iframe.scrolling = "no"; iframe.async = true;
		iframe.src = src;
		s.parentNode.insertBefore(iframe, s);
		return iframe;
	};

	__.newEUID = function newEUID () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	__.each = function (obj, iterator) {
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				iterator(obj[key], key, obj);
			};
		};
	};

	__.extend = function (obj) {
		var objects = Array.prototype.slice.call(arguments, 1);
		var counter = 0, limit = objects.length;

		while (counter < limit) {
			var current = objects[counter];

			for (var prop in current) {
				obj[prop] = current[prop];
			};

			counter++;
		};

		return obj;
	};

	__.indexOf = (function(){
		function indexOf (array, item) {
			var counter = 0, limit = array.length;
			for (; counter < limit; counter++) {
				if (array[counter] === item) {
					return counter;
				};
			};

			return -1;
		};

		return function (array, item) {
			if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) {
				return array.indexOf(item);
			};

			return indexOf(array, item);
		};
	})();

	__.toQueryParams = function toQueryParams (obj) {
		var working = [];

		__.each(obj, function(value, key, dict){
			working[working.length] = s.sprintf('%s=%s', encodeURIComponent(key), encodeURIComponent(value));
		});

		return (working.length ? '?' + working.join('&') : '');
	};

	// adapted from BackBone's Inherit
	__.inherits = (function(){
		var ctor = function(){};

		return function(parent, body, extend_prototypes) {
			var body = body || function(){};

			var child = function(){
				parent.apply(this, arguments);
				body.apply(this, arguments);
			};

			__.extend(child, parent);

			ctor.prototype = parent.prototype;
			child.prototype = new ctor();
			child.prototype.constructor = child;
			child.__super__ = parent.prototype;

			if (extend_prototypes) {
				__.extend(child.prototype, extend_prototypes);
			};

			return child;
		};
	})();

	// port of Kohana's Arr::path for JavaScript objects
	__.path = (function(){
		function dive (point, index, properties, default_value) {
			var prop_name = properties[index];

			try {
				if (typeof point[prop_name] !== 'undefined') {
					if (index === properties.length-1) {
						return point[prop_name];
					} else {
						return dive(point[prop_name], ++index, properties, default_value);
					};
				} else {
					return default_value;
				};
			} catch (e) {
				return default_value;
			};
		};

		return function(obj, pathstr, dv) {
			return dive(obj, 0, pathstr.split('.'), dv);
		};
	})();

	// define objects along a dot-delimited path
	// ie: var myObj = {}; __.definePath(myObj, 'a.b.c', 123); // makes myObj: { a: { b: { c: 123 } } }
	__.definePath = function (source, pathstr, destination_value) {
		var node = source,
		points = pathstr ? pathstr.split('.') : [],
		counter = 0,
		limit = points.length;

		while (counter < limit) {
			var part = points[counter];
			var nso = node[part];

			if (!nso) {
				nso = (destination_value && counter + 1 === limit) ? destination_value : {};
				node[part] = nso;
			};

			node = nso;
			counter++;
		};

		return node;
	};

	// walks an object's properties to see if it has a properity defined
	__.hasPath = (function(){
		function dive (point, index, properties) {
			var prop_name = properties[index];

			try {
				if (typeof point === 'object' && prop_name in point) {
					if (index === properties.length-1) {
						return true;
					} else {
						return dive(point[prop_name], ++index, properties);
					};
				} else {
					return false;
				};
			} catch (e) {
				return false;
			};
		};

		return function(obj, pathstr) {
			return dive(obj, 0, pathstr.split('.'));
		};
	})();

	__.getType = __.getClass = (function(obj) {
		var class_regex = /\s([a-zA-Z]+)/;

		return function(obj){
			return ({}).toString.call(obj).match(class_regex)[1].toLowerCase();
		};
	})();

	// adapted from: http://ejohn.org/projects/flexible-javascript-events/
	__.listen = function addEvent (element, type, callback) {
		if (element.attachEvent) {
			element['e' + type + callback] = callback;
			element[type + callback] = function(){
				element['e' + type + callback](window.event);
			};

			element.attachEvent('on' + type, element[type + callback] );
		} else {
			element.addEventListener(type, callback, false);
		};
	};

	__.unlisten = function removeEvent (element, type, callback) {
		if (element.detachEvent) {
			element.detachEvent('on' + type, element[type + callback]);
			element[type + callback] = null;
		} else {
			element.removeEventListener(type, callback, false);
		};
	};

	// time maths
	__.relativeDate = function relativeDate (base_date, values) {
		var new_date = new Date(base_date.getTime());

		__.each(values, function(value, key, dict){
			switch (key) {
			case 'years':
				new_date.setYear(base_date.getFullYear() + value);
			break;
			case 'months':
				new_date.setMonth(base_date.getMonth() + value);
			break;
			case 'days':
				new_date.setDate(base_date.getDate() + value);
			break;
			case 'hours':
				new_date.setHours(base_date.getHours() + value);
			break;
			case 'minutes':
				new_date.setMinutes(base_date.getMinutes() + value);
			break;
			case 'seconds':
				new_date.setSeconds(base_date.getSeconds() + value);
			break;
			case 'milliseconds':
				new_date.setMilliseconds(base_date.getMilliseconds() + value);
			break;
			};
		});

		return new_date;
	};

	// maths

	// converts radians to degrees

	__.rotd = (function(){
		var d = (Math.PI / 180);

		return function(radians){
			return radians / d;
		};
	})();

	__.humanReadable = function (n) {
		if (n < 1000) {
			return n;
		} else if (n < 1000 * 1000) {
			var thousands = Math.floor(n / 1000);
			return thousands + 'K';
		} else {
			var millions = (n / (1000 * 1000)).toFixed(1);
			return millions + 'M';
		};
	};

	return __;
});
