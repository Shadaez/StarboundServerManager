var config = require('./config.json');

var app = require('express')(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

server.listen(3000);

//start starbound server
var exec = require('child_process').exec,
	starbound_server = exec(config.pathToExe, function(error, stdout, stderr){
    	if (error !== null) {
      		console.log('exec error: ' + error);
  		}
	});

//reads 
starbound_server.stdout.on('data', function (data) {
  console.log(data);
});