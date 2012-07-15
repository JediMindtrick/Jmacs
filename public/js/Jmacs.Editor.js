/*Main Editor*/
(function(root,CM){

	var ns = root;

	/*handle 'Kill'*/
	var _posEq = function(a, b) {return a.line == b.line && a.ch == b.ch;}
	var _killLine = function(cm){
	 	var from = cm.getCursor(true), to = cm.getCursor(false), sel = !_posEq(from, to);
		var killed = '';
		if (!sel && cm.getLine(from.line).length == from.ch){
			killed = cm.getRange(from, {line: from.line + 1, ch: 0});
			cm.replaceRange("", from, {line: from.line + 1, ch: 0});
		}
      	else {
			killed = cm.getRange(from, sel ? to : {line: from.line});
			cm.replaceRange("", from, sel ? to : {line: from.line});
		}
	};

	ns.Jmacs = function(viewopts, options){
		this.EditContainer = '#' + viewopts.Editor;
		this.ModelineContainer = '#' + viewopts.Modeline;
		this.MinibufferContainer = '#' + viewopts.Minibuffer;
		this.Options = options || {};
		this.Services = this.Options.Services || {};
		this.Options.keyMap = CodeMirror.keyMap.emacsy;
		var self = this;

		this.Editor = new ns.SimpleEditor(viewopts.Editor,this.Options);

		this.Editor.addKeyBinding({
			'Ctrl-K': _killLine,
			'Ctrl-X': function(){
				self.Minibuffer.activate();
				self.Minibuffer.handleCombo('C-x');
			},
			'Alt-X': function(){
				self.Minibuffer.activate();
				self.Minibuffer.handleCombo('M-x');
			}
		});

		this.Minibuffer = new ns.JmacsMinibuffer(viewopts.Minibuffer,this,options);
		this.Minibuffer.notify('Jmacs initialized!');
	};

	ns.Jmacs.prototype.findFile = function(filename){
		var result = this.Services.findFile(filename);

		if(result.IsSuccess){
			this.CurrentBuffer = {
				Name: filename
			};
	
			this.setCurrentBufferText(result.Content);
		}

		return result;
	}

	ns.Jmacs.prototype.saveFile = function(){

		var result = this.Services.saveFile({
			FileName: this.CurrentBuffer.Name,
			Content: this.getCurrentBufferText()
		});

		return result;
	}

	ns.Jmacs.prototype.activateNextBuffer = function(){
		this.Editor._CM.focus();
	};
	
	ns.Jmacs.prototype.open = function(text,bufferName){
		this.Editor.open(text);

		this.Editor._CM.focus();

		var newPos = this.Editor._CM.getLine(0).length;
		this.Editor._CM.setCursor(newPos);
	};
	
	ns.Jmacs.prototype.getCurrentBufferText = function(){
		return this.Editor.getText();
	};

	ns.Jmacs.prototype.setCurrentBufferText = function(text){
		this.Editor.setText(text);
	};

	/*For now these are simple pass-throughs, but later will probably be more sophisticated*/
	ns.Jmacs.prototype.setOption = function(optName,val){
		this.Editor.setOption(optName,val);
	};

	ns.Jmacs.prototype.getOption = function(optName){
		return this.Editor.getOption(optName);
	};	

})(window.Jmacs,CodeMirror);


/*ComboTracker*/
(function(root){

	var ns = root;
/*This code shamelessly copied from codemirror.js*/
  	var keyNames = {3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
                  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
                  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
                  46: "Delete", 59: ";", 91: "Mod", 92: "Mod", 93: "Mod", 127: "Delete", 186: ";", 187: "=", 188: ",",
                  189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'", 63276: "PageUp",
                  63277: "PageDown", 63275: "End", 63273: "Home", 63234: "Left", 63232: "Up", 63235: "Right",
                  63233: "Down", 63302: "Insert", 63272: "Delete"};

  	(function() {
    	// Number keys
    	for (var i = 0; i < 10; i++) keyNames[i + 48] = String(i);
	    // Alphabetic keys
    	for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
	    // Function keys
//for now we won't handle function keys
//    	for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
	})();
/*end copied code*/

	ns.ComboTracker = function(){
		this.reset();
	};

	ns.ComboTracker.prototype.reset = function(){
		this.ActiveKeys = {
			'C-':false,
			'M-':false,
			'Shift-':false
		};
	};

	/*ke = KeyboardEvent*/
	ns.ComboTracker.prototype.parseCombo = function(ke){
		var toReturn = null;

		var code = ke.keyCode;
		var IsSpecial = code === 17 || code === 18 || code === 16;

		if(ke.type === 'keydown'){
			if(code === 16) this.ActiveKeys['Shift-'] = true;
			if(code === 17) this.ActiveKeys['C-'] = true;
			if(code === 18) this.ActiveKeys['M-'] = true;
		}else if (ke.type === 'keyup'){
			if(code === 16) this.ActiveKeys['Shift-'] = false;
			if(code === 17) this.ActiveKeys['C-'] = false;
			if(code === 18) this.ActiveKeys['M-'] = false;
		}

		if(!IsSpecial && keyNames[code] && ke.type === 'keydown'){
			toReturn = '';
			if(this.ActiveKeys['C-']) toReturn = toReturn + 'C-';
			if(this.ActiveKeys['M-']) toReturn = toReturn + 'M-';

			var codeAsString = keyNames[code];
			if(code >= 65 && code <= 90 && !this.ActiveKeys['Shift-']){
				codeAsString = codeAsString.toLowerCase();
			}

			toReturn = toReturn + codeAsString;
		}

		return toReturn;
	};

})(window.Jmacs);