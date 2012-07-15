(function(root,CM){

	var ns = root;

	ns.SimpleEditor = function(viewport, options){
		var self = this;
		
		var _defaultOptions = {
			lineNumbers:true,
			lineWrapping:true,
			onGutterClick: self._foldFunc,
			extraKeys: {'Ctrl-Q': function(cm){self._foldFunc(cm,cm.getCursor().line);}}
		};


		this.Viewport = '#' + viewport;
		this.Options = options || _defaultOptions;

		//map defaults over, where appropriate
		for(var opt in _defaultOptions){
			if(_defaultOptions.hasOwnProperty(opt) && !this.Options.hasOwnProperty(opt)){
				this.Options[opt] = _defaultOptions[opt];
			}
		}
		
  		this._CM = CM.fromTextArea(document.getElementById(viewport), this.Options); 

		//mode option
		this._CM.setOption('mode',(this.Options.Mode && this.Options.Mode !== '' ? this.Options.Mode : 'javascript'));

		//theme option
		if(this.Options.Theme){
			this._CM.setOption('theme',this.Options.Theme);
			this._CM.setOption('onCursorActivity',this._getOnCursorActivityFunc());
		}

	};

	ns.SimpleEditor.prototype.addKeyBinding = function(toSet){
		var currKeys = this._CM.getOption('extraKeys');
		for(var kvp in toSet){
			if(toSet.hasOwnProperty(kvp)){
				currKeys[kvp] = toSet[kvp];
			}
		}

		this._CM.setOption('extraKeys',currKeys);
	};

	ns.SimpleEditor.prototype._foldFunc = CM.newFoldFunction(CM.braceRangeFinder);

	ns.SimpleEditor.prototype._getOnCursorActivityFunc = function(){
		var self = this;

		var curr = self.Options.Theme;
		var hlLine = self._CM.setLineClass(self._CM.getCursor().line,null, 'cm-s-' + curr + ' activeline');

		var toReturn = function(){
			self._CM.setLineClass(hlLine,null,null);
			hlLine = self._CM.setLineClass(self._CM.getCursor().line,null,'cm-s-' + curr + ' activeline');
		};

		return toReturn;
	};

	ns.SimpleEditor.prototype.open = function(text){
		this._CM.setValue(text);
	};
	
	ns.SimpleEditor.prototype.getText = function(){
		return this._CM.getValue();
	};

	ns.SimpleEditor.prototype.setText = function(text){
		this._CM.setValue(text);
	};

	/*For now these are simple pass-throughs, but later will probably be more sophisticated*/
	ns.SimpleEditor.prototype.setOption = function(optName,val){
		this._CM.setOption(optName,val);
	};

	ns.SimpleEditor.prototype.getOption = function(optName){
		return this._CM.getOption(optName);
	};	

})(window.Jmacs || exports,CodeMirror);