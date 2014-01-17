var app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	fs = require('fs'),
	config = require('./config.json'),
	events = require('events'),
	eventEmitter = new events.EventEmitter(),
	running = false;

server.listen(3000);

var regexp = {
	//runs a match on the line on all the regexps (except server, that only needs to run when the servers being started) and broadcasts to all sockets.
	tests: function(line){
		if (!running){
			this.server.test();
		} else {
			if(line.match(this.chat)){
				//add line to chat log, emit to sockets
				return line
			} else if(line.match(this.world)){
				//check if world is loading or unloading, and add or remove them from list, emit to sockets
				return line
			} else if(line.match(this.client)){
				//check if they disconnect or connect, and then add or remove them from list, emit to sockets
				return line
			}
		}
	},
	client: new RegExp("^Info: Client '(.*)' <\d> \((\d*.\d.\d.\d):\d*\) (\w*)"),
	worlds: new RegExp("^Info: Loading world db for world (.*)"),
	chat: new RegExp("^Info:\s+<(.*)>(.*)"),
	server: new RegExp("^Info: \w{3}Server listening on")
}

//start starbound server
var exec = require('child_process').exec,
	starbound_server = exec(config.pathToExe + "starbound_server.exe", function(error, stdout, stderr){
    	if (error !== null) {
      		console.log('exec error: ' + error);
  		}
	});

//reads 
starbound_server.stdout.on('data', function (data) {
	console.log(regexp.tests(data));
});
io.sockets.on('connection', function (socket) {
	socket.on('restart', function(){
		//if session is admin, else emit error	
	});
	socket.on('stop', function(){
		//if session is admin, else emit error  
	});
	socket.on('start', function(){
		//if session is admin, else emit error  
	});
});