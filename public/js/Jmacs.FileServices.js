(function(root,$){

	root.FileService = {
		findFile: function(filename,onSuccess,onError){
			var endpoint = '/Jmacs/findFile';
			var toReturn = {
				Errors: []
			};
			var toSend = {
				"User": 'brandon',
				"FileName": filename
			};

			$.ajax({
				async: false,
				type: "POST",
				contentType: "application/json",
				dataType: "json",
				url: endpoint,
				data: JSON.stringify(toSend),
				success: function(data, textStatus, jqXHR){
					toReturn = data;

					if(onSuccess){
						onSuccess(data, textStatus, jqXHR);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					toReturn.IsSuccess = false;
					toReturn.Errors.push('ajax error ' + errorThrown);

					if(onError){
						onError(jqXHR, textStatus, errorThrown);
					}	
				}
			});
		
			return toReturn;
		},
		saveFile: function(opts,onSuccess,onError){
			var endpoint = '/Jmacs/saveFile';
			var toReturn = {
				Errors: []
			};
			var toSend = {
				"User": 'brandon',
				"FileName": opts.FileName,
				"Content": opts.Content
			};

			$.ajax({
				async: false,
				type: "POST",
				contentType: "application/json",
				dataType: "json",
				url: endpoint,
				data: JSON.stringify(toSend),
				success: function(data, textStatus, jqXHR){
					toReturn = data;

					if(onSuccess){
						onSuccess(data, textStatus, jqXHR);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					toReturn.IsSuccess = false;
					toReturn.Errors.push('ajax error ' + errorThrown);

					if(onError){
						onError(jqXHR, textStatus, errorThrown);
					}	
				}
			});
		
			return toReturn;
		}
	};

})(window.Jmacs || exports,jQuery);
