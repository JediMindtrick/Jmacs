/*Minibuffer*/
(function(root,CM){

	var ns = root;

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

	ns.JmacsMinibuffer = function(viewport, app, options){
		var self = this;

		this.Viewport = '#' + viewport;
		this.Options = options || {};
		this.App = app;
		options.Theme = 'cobalt-mini';

		this.ComboTracker = new ns.ComboTracker();
		this.CurrentCombo = '';

		this.Minibuffer = new ns.SimpleEditor(viewport,options);
		ns.configureCommands(this);
		this.Minibuffer.setOption('mode','xml');
		this.Minibuffer.addKeyBinding({
			'Ctrl-K': _killLine,
			'Ctrl-S': self.handleCombo('C-s')
		});

		this.Minibuffer.setOption('onKeyEvent',function(e,KeyboardEvent){

			KeyboardEvent.cancelBubble = true;

			var combo = self.ComboTracker.parseCombo(KeyboardEvent);
			if(combo && self.handleCombo(combo)){
				KeyboardEvent.stop();
				return true;
			}
			
			return false;
		});

		$(this.Viewport).next('.CodeMirror').find('.CodeMirror-scroll').css('height','30');
	};

	ns.JmacsMinibuffer.prototype.activate = function(){	
		this.Minibuffer._CM.focus();
	};

	ns.JmacsMinibuffer.prototype.DefaultCombo = function(){throw 'not initialized!'};

	ns.JmacsMinibuffer.prototype.onNextCombo = function(){throw 'not initialized!'};

	ns.JmacsMinibuffer.prototype.reset = function(){
		this.onNextCombo = function(combo,minibuffer){
			this.CurrentCombo = '';
			this.onNextCombo = this.DefaultCombo;		

			return minibuffer.onNextCombo(combo,minibuffer);
		};
	};

	ns.JmacsMinibuffer.prototype.handleCombo = function(combo){
		var self = this;

		if(combo === 'C-g' || combo === 'C-M-g'){
			this.notify('Quit');	
			this.reset();
		}else{
			this.CurrentCombo = this.onNextCombo(combo,this);
			this.notify(this.CurrentCombo);
		}

		var newPos = this.Minibuffer._CM.getLine(0).length;
		this.Minibuffer._CM.setCursor(newPos);

		return true;
	};

	ns.JmacsMinibuffer.prototype.notify = function(text){
		var toNotify = text.substring(0,100);
		this.Minibuffer.setText(toNotify);
	};

	ns.JmacsMinibuffer.prototype.open = function(text){
		this.Minibuffer.open(text);
	};
	
	ns.JmacsMinibuffer.prototype.getText = function(){
		return this.Minibuffer.getText(currVal);
	};

	ns.JmacsMinibuffer.prototype.setText = function(text){
		this.Minibuffer.setText(text);
	};

	/*For now these are simple pass-throughs, but later will probably be more sophisticated*/
	ns.JmacsMinibuffer.prototype.setOption = function(optName,val){
		this.Minibuffer.setOption(optName,val);
	};

	ns.JmacsMinibuffer.prototype.getOption = function(optName){
		return this.Minibuffer.getOption(optName);
	};	

})(window.Jmacs,CodeMirror);

/*Minibuffer commands*/
(function(root){

	var ns = root;
	
	var _echoCombo = function(combo,minibuffer){
		minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo + ' ';

		return minibuffer.CurrentCombo;
	};

	var _shortcutCombo = function(combo,minibuffer){
		var newCombo = minibuffer.CurrentCombo + combo;

		if(newCombo === 'C-x u'){
			minibuffer.reset();
			return 'Undo!';
		}else if (newCombo === 'C-x o'){
			minibuffer.reset();
			minibuffer.App.activateNextBuffer();
			return '';
		}else if (newCombo === 'C-x C-f'){
			minibuffer.onNextCombo = _findFileCombo;
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo + ' ';
			return 'Find File: ';
		}else if (newCombo === 'C-x C-s'){

			var result = minibuffer.App.saveFile();

			if(result.IsSuccess){
				minibuffer.reset();
				minibuffer.App.activateNextBuffer();
				return 'BufferSaved';
			}else if(result.Errors && result.Errors.length > 0){
				minibuffer.reset();
				minibuffer.App.activateNextBuffer();
				return 'unable to save buffer ' + 'error: "' + result.Errors[0] + '"';
			}

		}else{
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo + ' ';
			return minibuffer.CurrentCombo;
		}
	};



	var _findFileCombo = function(combo,minibuffer){

		if(combo === 'Space'){
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + ' ';
		}else if (combo === 'Enter'){
			var resource = '';

			var firstSpace = minibuffer.CurrentCombo.indexOf(' ');

			if(firstSpace + 1 < minibuffer.CurrentCombo.length){
				resource = minibuffer.CurrentCombo.substring(firstSpace + 1);
			}

			var secondSpace = resource.indexOf(' ');

			if(secondSpace + 1 < resource.length){
				resource = resource.substring(secondSpace + 1);
			}else{
				resource = '';
			}

			if(resource === ''){
				minibuffer.reset();
				minibuffer.App.activateNextBuffer();
				return 'invalid operation';
			}

			var result = minibuffer.App.findFile(resource);

			if(result.IsSuccess){
				minibuffer.reset();
				minibuffer.App.activateNextBuffer();
				return 'loaded buffer: ' + resource;
			}else if(result.Errors && result.Errors.length > 0){
				minibuffer.reset();
				minibuffer.App.activateNextBuffer();
				return 'unable to load buffer ' + resource + ' error: "' + result.Errors[0] + '"';
			}


		}else if (combo.length > 1){

			minibuffer.reset();
			return 'Invalid command: ' + combo;
		}else{
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo;
		}

		return minibuffer.CurrentCombo;
	};

	var _commandCombo = function(combo,minibuffer){

		if(combo === 'Space'){
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + ' ';
		}else if (combo === 'Enter'){
			var args = minibuffer.CurrentCombo.split(' ');

			minibuffer.reset();
			minibuffer.App.activateNextBuffer();
			return 'ran command: ' + args[1];
		}else if (combo.length > 1){

			minibuffer.reset();
			minibuffer.App.activateNextBuffer();
			return 'Invalid command: ' + combo;
		}else{
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo;
		}

		return minibuffer.CurrentCombo;
	};

	var _defaultCombo = function(combo,minibuffer){

		if(combo === 'C-g' || combo === 'C-M-g'){
			minibuffer.reset();			
			return 'Quit';	
		}else if(combo === 'M-x'){
			minibuffer.onNextCombo = _commandCombo;
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo + ' ';
		}else if (combo === 'C-x'){
			minibuffer.onNextCombo = _shortcutCombo;
			minibuffer.CurrentCombo = minibuffer.CurrentCombo + combo + ' ';
		}
		else{
			minibuffer.reset();
			return 'Unrecognized Sequence: ' + minibuffer.CurrentCombo + combo;
		}

		return minibuffer.CurrentCombo;
	};

	ns.configureCommands = function(minibuffer){
		minibuffer.DefaultCombo = _defaultCombo;

		minibuffer.onNextCombo = _defaultCombo;	
	};	

})(window.Jmacs);
