__lib__.provide('editor', ['xhr', 'util', 'sprintf', 'marked', 'editor.jst'], function(XHR, __, s, marked, EditorTemplate){
	var Editor = function Editor () {
		this.el = document.createElement('div');
		this.el.className = 'editor';
		this.el.innerHTML = EditorTemplate;

		this.file = null;
		this.file_exists = false;

		this.filename = this.el.querySelector('#filename');
		this.write_button = this.el.querySelector('#write_button');
		this.save_button = this.el.querySelector('#save_button');
		this.textarea = this.el.querySelector('textarea');
		this.preview_target = this.el.querySelector('#preview_target');
		this.current_file = this.el.querySelector('#current_file');
		this.revisions = this.el.querySelector('#revisions');

		var self = this;
		__.listen(this.filename, 'input', function(){
			if (self.filename.value.length) {
				self.toggleWriteButton(true);
				self.checkFile(self.filename.value);
			} else {
				self.toggleWriteButton(false);
			};
		});

		__.listen(this.textarea, 'input', function(){
			self.preview();
		});

		__.listen(this.write_button, 'click', function(e){
			e.preventDefault();

			if (self.file_exists) {
				self.getFile(self.filename.value);
			} else {
				self.createFile(self.filename.value);
			};

			self.filename.value = '';
			self.toggleWriteButton(false);
		});

		__.listen(this.save_button, 'click', function(e){
			e.preventDefault();

			if (self.file) {
				self.saveRevision();
			};
		});

		__.listen(this.revisions, 'change', function(){
			self.displayRevision(self.revisions.value);
		});
	};

	Editor.prototype.checkFile = function checkFile (filename) {
		var xhr = new XHR({
			method: 'GET',
			url: s.sprintf('//vmarch.dev:8035/x/exists/%s', filename)
		});

		var self = this;
		xhr.on('success', function(xhr, responseText, status){
			var resp = JSON.parse(responseText);
			self.file_exists = resp.exists;
			self.displayFileStatus();
		});
	};

	Editor.prototype.getFile = function getFile (filename) {
		var xhr = new XHR({
			method: 'GET',
			url: s.sprintf('//vmarch.dev:8035/x/meta/%s', filename)
		});

		var self = this;
		xhr.on('success', function(xhr, responseText, status){
			var resp = JSON.parse(responseText);
			self.editFile(new File(filename, resp.revisions));
		});
	};

	Editor.prototype.createFile = function createFile (filename) {
		var xhr = new XHR({
			method: 'POST',
			url: s.sprintf('//vmarch.dev:8035/c/%s', filename)
		});

		var self = this;
		xhr.on('success', function(xhr, responseText, status){
			self.editFile(new File(filename));
		});
	};

	Editor.prototype.editFile = function editFile (file) {
		this.file = file;
		this.textarea.value = '';
		this.preview_target.innerHTML = '';
		this.current_file.innerHTML = file.filename;
		this.displayRevisionList();

		if (file.revisions.length) {
			this.displayRevision(file.revisions[file.revisions.length-1]);
		};
	};

	Editor.prototype.displayRevision = function displayRevision(sha) {
		var xhr = new XHR({
			method: 'GET',
			url: s.sprintf('//vmarch.dev:8035/r/%s', sha)
		});

		var self = this;
		xhr.on('success', function(xhr, responseText, status){
			self.textarea.value = responseText;
			self.preview();
		});
	};

	Editor.prototype.saveRevision = function saveRevision () {
		var xhr = new XHR({
			method: 'PUT',
			url: s.sprintf('//vmarch.dev:8035/c/%s', this.file.filename),
			data: this.textarea.value
		});

		var self = this;
		xhr.on('success', function(xhr, responseText, status){
			var resp = JSON.parse(responseText);
			self.file.revisions.push(resp.sha);
			self.displayRevisionList();
		});
	};

	Editor.prototype.preview = function preview () {
		this.preview_target.innerHTML = marked(this.textarea.value);
	};

	Editor.prototype.toggleWriteButton = function toggleWriteButton (enabled) {
		if (enabled) {
			this.write_button.removeAttribute('disabled');
		} else {
			this.write_button.setAttribute('disabled', 'disabled');
		};
	};

	Editor.prototype.displayFileStatus = function displayFileStatus () {
		if (this.file_exists) {
			this.write_button.innerHTML = 'Edit Existing File';
		} else {
			this.write_button.innerHTML = 'Create New File';
		};
	};

	Editor.prototype.displayRevisionList = function displayRevisionList () {
		var frag = document.createDocumentFragment();

		for (var x = 0, n = this.file.revisions.length; x < n; x++) {
			var option = document.createElement('option');
			option.value = option.innerHTML = this.file.revisions[x];
			if (x === n-1) {
				option.setAttribute('selected', 'selected');
			};
			frag.appendChild(option);
		};

		frag.chid
		this.revisions.innerHTML = '';
		this.revisions.appendChild(frag);
	};

	var File = function File(filename, revisions){
		this.filename = filename;
		this.revisions = revisions || [];	
	};

	return Editor;
});
