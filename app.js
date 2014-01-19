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
		if (global.status !== "up") {
			if (this.server.test(line)) {
				console.log("Server's Up!")
				io.sockets.emit("status", "up");
				global.status = "up";
			}
		}
		if (this.chat.test(line)) {
			var test = line.match(this.chat);
			var data = {
				user: test[1],
				message: test[2]
			};
			io.sockets.emit('chat', data);
			global.chatLog.push(data);
			if (global.chatLog.length > global.logLength) {
				global.chatLog.shift();
			}

			console.log("<" + data.user + "> " + data.message);

			//add line to chat log, emit to sockets
		} else if (this.world.test(line)) {
			var test = line.match(this.world);

			var data = {
				type: test[1],
				world: test[3]
			};
			io.sockets.emit("world", data);
			if (data.type === "Shutting down") {
				global.worlds.splice(global.worlds.indexOf(data.world), 1);
			} else if (data.type === "Loading") {
				global.worlds.push(data.world);
			}
			console.log(data.type + " world " + data.world + ".");
			//check if world is loading or unloading, and add or remove them from list, emit to sockets
		} else if (this.user.test(line)) {
			var test = line.match(this.user);

			var data = {
				name: test[1],
				ip: test[2],
				type: test[3]
			};

			if (data.type === "disconnected") {
				global.users.splice(global.users.indexOf({
					name: data.name,
					ip: data.ip
				}), 1);
			} else {
				global.users.push({
					name: data.name,
					ip: data.ip
				});
			}
			io.sockets.emit("user", data)
			console.log("Client " + data.name + " " + data.type + ".");
			//check if they disconnect or connect, and then add or remove them from list, emit to sockets
		} //convert to a foreach or something
	},
	user: /^Info:\s+Client '(.*)' <\d> \((\d*.\d.\d.\d):\d*\) ((dis)?connected)/,
	world: /^Info:\s+(Loading|Shutting down)\s?(world db for)?\sworld\s([:?\-?\w]+)/,
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
		if (authenticate(data.password)) {
			if ((data.type === "stop" || data.type === "restart") && global.status !== "down") {
				io.sockets.emit("status", "down");
				//kill process
				starbound_server.exit();
				//reinitiate globals
				global = initGlobal
			}
			if ((data.type === "start" || data.type === "restart") && global.status === "down") {
				//start process
				io.sockets.emit("status", "starting");
				global.status = "starting";
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
		status: "down",
		users: [],
		worlds: [],
		chatLog: [],
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