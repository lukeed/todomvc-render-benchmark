(function(){
	var ESCAPE_KEY = 27;
	var ENTER_KEY = 13;
	
	// this way of caching is not the 'Imba way' - it is merely a very simple way
	// to do something similar to React 'shouldComponentUpdate'. You can implement
	// this however you want - you merely try to figure out whether anything have
	// changed inside tag#commit, and then rerender if it has.
	return tag$.defineTag('todo', 'li', function(tag){
		
		tag.prototype.model = function (){
			return this.up(q$('._app',this)).model();
		};
		
		// commit is always called when a node is rendered as part of an outer tree
		// this is where we decide whether to cascade the render through to inner
		// parts of this.
		
		// improvised alternative to React shouldComponentUpdate
		// you can do this however you want. In Imba there is really no reason
		// not to render (since it is so fast) - but to make it behave like
		// the react version we only render the content if we know it has changed
		
		tag.prototype.commit = function (){
			if (API.FULLRENDER) { return this.render() };
			
			if (this._hash != this.hash(this.object())) {
				this._hash = this.hash(this.object());
				this.render();
			};
			
			return this;
		};
		
		
		tag.prototype.hash = function (o){
			return "" + o.title + o.completed + this._editing;
		};
		
		tag.prototype.render = function (){
			var t0, t1;
			var todo = this._object;
			
			return this.flag('completed',(todo.completed)).setChildren([
				(t0 = this.$a=this.$a || tag$.$div().flag('view')).setContent([
					(t1 = t0.$$a=t0.$$a || tag$.$label().setHandler('dblclick','edit',this)).setContent(("" + (todo.title)),3).end(),
					(this._toggle = this._toggle || tag$.$input().setRef('toggle',this).setType('checkbox').setHandler('change','toggle',this)).setChecked((todo.completed)).end(),
					(t0.$$c = t0.$$c || tag$.$button().flag('destroy').setHandler('tap','drop',this)).end()
				],2).end(),
				(this._input = this._input || tag$.$input().setRef('input',this).flag('edit').setType('text')).end()
			],2).synced();
		};
		
		tag.prototype.edit = function (){
			var self = this;
			this._editing = true;
			this.flag('editing');
			this._input.setValue(this.object().title);
			setTimeout(function() { return self._input.focus(); },10);
			return self.render(); // only need to render this
		};
		
		tag.prototype.drop = function (){
			return this.model().destroy(this.object());
		};
		
		tag.prototype.toggle = function (e){
			this.object().completed = this._toggle.checked();
			return this.model().inform();
		};
		
		tag.prototype.submit = function (){
			this._editing = false;
			this.unflag('editing');
			var title = this._input.value().trim();
			return title ? (this.model().rename(this.object(),title)) : (this.model().destroy(this.object()));
		};
		
		tag.prototype.onfocusout = function (e){
			if (this._editing) { return this.submit() };
		};
		
		tag.prototype.cancel = function (){
			this._editing = false;
			this.unflag('editing');
			this._input.blur();
			return this.render();
		};
		
		// onkeydown from inner element cascade through
		tag.prototype.onkeydown = function (e){
			e.halt();
			if (e.which() == ENTER_KEY) this.submit();
			if (e.which() == ESCAPE_KEY) { return this.cancel() };
		};
	});
	

})()