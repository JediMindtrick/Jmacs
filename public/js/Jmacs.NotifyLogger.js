(function(root,$){

	var ns = root.Views;

	ns.NotifyLogger = function(notification,console){
		this.console = $('#' + console);
		this.notification = $('#' + notification);
		var console = this.console;

		$(this.notification).dblclick(function(e){
			$(console).dialog({ height: 500, maxHeight: 500, width: 500 });	
		});

		this.messages = [];
	};

	ns.NotifyLogger.prototype.log = function(msg){
		this.messages.push(msg);
		$(this.notification).html(msg);
		$(this.console).find('table tbody').append('<tr><td  style="border-top: thin solid black;">' + msg + '</td></tr>');
	};

})(window.Jmacs,jQuery);
