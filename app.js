var express = require('express'),
	path = require("path"),
	app = express().use(express.static(path.join(__dirname, "public"))),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	fs = require('fs'),
	os = require('os'),
	config = require('./config.json'),
	exec = require('child_process').exec,
	execFile = require('child_process').execFile,
	sbConfig = JSON.parse(fs.readFileSync(config.path + "starbound.config"));

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
			//add line to chat log, emit to sockets
			var test = line.match(this.chat);
			chatEvent({
				user: test[1],
				message: test[2]
			});

		} else if (this.world.test(line)) {
			var test = line.match(this.world);
			//check if world is loading or unloading, and add or remove them from list, emit to sockets
			worldEvent({
				type: test[1],
				world: test[3]
			});

		} else if (this.user.test(line)) {
			var test = line.match(this.user);
			//check if they disconnect or connect, and then add or remove them from list, emit to sockets
			userEvent({
				name: test[1],
				ip: test[2],
				type: test[3]
			});
		}
	},
	user: /^Info:\s+Client '(.*)' <\d> \((\d+.\d+.\d+.\d+):\d+\) ((dis)?connected)/,
	world: /^Info:\s+(Loading|Shutting down)\s?(world db for)?\sworld\s([:?\-?\w]+)/,
	chat: /^Info:\s+<(.*)>\s(.*)/,
	server: /^Info:\s+bind.*/
}

beginListener();

//socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('init', global);
	socket.on('exec', function(data) {
		if (authenticate(data.password)) {
			if ((data.type === "stop" || data.type === "restart") && global.status !== "down") {
				io.sockets.emit("status", "down");
				//kill process
				if (os.platform() === "win32") {
					console.log(starbound_server.pid)
					exec("TASKKILL /T /F /PID " + starbound_server.pid)
				} else {
					starbound_server.kill("SIGTERM");
				}
				//reinitiate globals
				global = initGlobal();
			}
			if ((data.type === "start" || data.type === "restart") && global.status === "down") {
				//start process
				starbound_server = startServer();
				beginListener();
			}
		} else {
			io.sockets.emit("wrongPassword", true);
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
		logLength: 50,
		serverName: sbConfig.serverName
	};
	io.sockets.emit('init', global)
	return global;
}

function startServer() {
	io.sockets.emit("status", "starting");
	global.status = "starting";
	return execFile(config.path + platform(), function(error, stdout, stderr) {});
}

function platform() {
	var platform = os.platform(),
		arch = os.arch();
	if (platform === "win32") {
		return "win32/starbound_server.exe";
	} else if (arch === "x64") {
		return "linux64/starbound_server"
	} else {
		return "linux32/starbound_server"
	}
}

function worldEvent(data) {
	io.sockets.emit("world", data);
	if (data.type === "Shutting down") {
		global.worlds.splice(global.worlds.indexOf(data.world), 1);
	} else if (data.type === "Loading") {
		global.worlds.push(data.world);
	}
}

function chatEvent(data) {
	io.sockets.emit('chat', data);
	global.chatLog.push(data);
	if (global.chatLog.length > global.logLength) {
		global.chatLog.shift();
	}
}

function userEvent(data) {
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
	chatEvent({
		user: "server",
		message: "User " + data.name + " has " + data.type + "."
	})
	io.sockets.emit("user", data)
}

function beginListener() {
	starbound_server.stdout.on('data', function(data) {
		regexp.tests(data);
	});
}