__lib__.provide('xhr', ['util', 'events'], function(__, Events){
	var XHR = __.inherits(Events, function XHR (params) {
		__.extend(this, params);
		var self = this;

		self.xhr = new self.xhrconstructor;

		self.xhr.onreadystatechange = function(){
			switch (self.xhr.readyState) {
			case 0:
			case 1:
				// hasn't been sent yet, do nothing
			break;

			case 2:
				self.fireOneShot('start');
			break;

			case 3:
				self.fireOneShot('downloading');
			break;

			case 4:
				self.fireOneShot('complete', self.xhr.responseText, self.xhr.status);

				switch (self.xhr.status) {
				case 200:
					self.fireOneShot('success', self.xhr.responseText, self.xhr.status);
				break;

				default:
					self.fireOneShot('failure', self.xhr.responseText, self.xhr.status);
				break;
				};
			};
		};
		
		self.xhr.open(self.method, self.url);

		if (self.headers !== null) {
			__.each(self.headers, function(value, key){
				self.xhr.setRequestHeader(key, value);
			});
		};

		if (self.data !== null) {
			self.xhr.send(self.data);
		} else {
			self.xhr.send();
		};
	}, {
		// params
		url: window.location.href,
		method: 'GET',
		data: null,
		headers: null,

		// contants
		xhrconstructor: (window.XMLHttpRequest ? XMLHttpRequest : ActiveXObject("Microsoft.XMLHTTP")),

		// methods
		abort: function abort () {
			this.xhr.abort();
			this.fire('abort');
			return this;
		}
	});

	return XHR;
});
