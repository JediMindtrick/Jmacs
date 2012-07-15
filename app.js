/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
, FileServices = require('./routes/FileServices.js')
, Permissioner = require('./model/PermissionService.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.enable('serverSaveConfig');
	FileServices.Config.saveConfig = true;
	FileServices.Config.ConfigPath = './public/store/test.js';
	FileServices.Config.StorePath = './public/store/';
	FileServices.Config.Permissioner = Permissioner;
});

app.configure('production', function(){
 	app.use(express.errorHandler());
	app.disable('serverSaveConfig');
	FileServices.Config.saveConfig = false;
});

// Routes
app.get('/Documentation', routes.list);
app.get('/Documentation/:doc', routes.document);
app.post('/FileServices/saveConfig', FileServices.saveConfig);
app.post('/Jmacs/findFile', FileServices.Jmacs.findFile);
app.post('/Jmacs/saveFile', FileServices.Jmacs.saveFile);

var port = 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
