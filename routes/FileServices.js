var fs = require('fs');

exports.Config = {
	saveConfig: false,
	ConfigPath: null,
	StorePath: null
};

exports.Jmacs = {};

/*
url = /Jmacs/findFile
*/
exports.Jmacs.findFile = function(req, res){
	cfg = exports.Config;
	var data = req.body;
	var success = true;
	var errors = [];
	var content = '';
	var resource = data.FileName;

	if(!cfg.Permissioner.hasPermission(data.User, resource, 'r')){
		success = false;
		errors.push('This function has been disabled');
	}else{
		content = fs.readFileSync(exports.Config.StorePath + data.FileName,'utf8');
	}

	res.send({
		IsSuccess: success,
		Errors: errors,
		Content: content
	});

};

/*
url = /Jmacs/saveFile
*/
exports.Jmacs.saveFile = function(req, res){
	cfg = exports.Config;
	var data = req.body;
	console.log(data);

	var success = true;
	var errors = [];
	var content = data.Content;
	var resource = data.FileName;
	var fullPath = exports.Config.StorePath + data.FileName;

	if(!cfg.Permissioner.hasPermission(data.User, resource, 'w')){
		console.log('permission denied');
		success = false;
		errors.push('This function has been disabled');
	}else{
		console.log('path: ' + fullPath);
		console.log('to write: ');
		console.log(content);

		try{
			fs.writeFileSync(fullPath, content);
		}catch(err){
			console.log(err);
			success = false;		
			errors.push(err);
		}
	}

	res.send({
		IsSuccess: success,
		Errors: errors
	});

};
