var express = require('express'),
	path = require("path"),
	app = express().use(express.static(path.join(__dirname, "public")));
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	fs = require('fs'),
	config = require('./config.json'),
	events = require('events'),
	eventEmitter = new events.EventEmitter(),
	exec = require('child_process').exec;
	
server.listen(3000);

app.get("/");

var global = initGlobal();
var starbound_server = startServer();
var regexp = {
	//runs a match on the line on all the regexps (except server, that only needs to run when the servers being started) and broadcasts to all sockets.
	tests: function(line) {
		if (global.running !== "up") {
			if (this.server.test(line)) {
				var test = line.match(this.client)
				console.log("Server's Up!")
				io.sockets.emit("running", "up");
				global.running = "up";
			}
		}
		if (this.chat.test(line)) {

			var test = line.match(this.chat);
			var data = {
				user: test[1],
				message: test[2]
			};
			io.sockets.emit('chat', data);
			global.chat.push("<" + test[1] + "> " + test[2]);
			if (global.chat.length > global.logLength) {
				global.chat.shift();
			}

			console.log("<" + test[1] + "> " + test[2]);

			//add line to chat log, emit to sockets
		} else if (this.worlds.test(line)) {
			var test = line.match(this.worlds);

			var data = {
				type: test[1],
				world: test[3]
			};
			io.sockets.emit("world", data);
			if (test[1] === "Shutting down") {
				global.worlds.splice(global.clients.indexOf(test[3]), 1);
			} else if (test[1] === "Loading") {
				global.worlds.push(test[3]);
			}
			console.log(test[1] + " world " + test[3] + ".");
			//check if world is loading or unloading, and add or remove them from list, emit to sockets
		} else if (this.client.test(line)) {
			var test = line.match(this.client);

			var data = {
				name: test[1],
				ip: test[2],
				type: test[3]
			};

			if (test[3] === "disconnected") {
				global.clients.splice(global.clients.indexOf(test[1]), 1);
			} else {
				global.clients.push(test[1]);
			}
			io.sockets.emit("client", data)
			console.log("Client " + test[1] + " " + test[3] + ".");
			//check if they disconnect or connect, and then add or remove them from list, emit to sockets
		} //convert to a foreach or something
	},
	client: /^Info:\s+Client '(.*)' <\d> \((\d*.\d.\d.\d):\d*\) ((dis)?connected)/,
	worlds: /^Info:\s+(Loading|Shutting down)\s?(world db for)?\sworld\s([:?\-?\w]+)/,
	chat: /^Info:\s+<(.*)>\s(.*)/,
	server: /^Info:\s+bind.*/
}

//reads 
starbound_server.stdout.on('data', function(data) {
	regexp.tests(data);
});

//socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('init', global);
	socket.on('exec', function(data) {
		if(authenticate(data.password)) {
			if((data.type === "stop" || data.type === "restart") && global.running !== "down"){
				io.sockets.emit("running", "down");
				//kill process
				starbound_server.exit();
				//reinitiate globals
				global = initGlobal
			}
			if((data.type === "start" || data.type === "restart") && global.running === "down"){
				//start process
				io.sockets.emit("running", "starting");
				global.running = "starting";
				starbound_server = startServer();
			}
		} else {
			io.socket.emit("wrongPassword", true);
		}
	});
});

function authenticate(password) {
	return config.password.indexOf(password) != -1;
}

function initGlobal() {
	var global = {
		running: "down",
		clients: [],
		worlds: [],
		chat: [],
		logLength: 50
	};
	io.sockets.emit('init', global)
	return global;
};

function startServer() {
	return exec(config.pathToExe + "starbound_server.exe", function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
};