var express = require('express'),
	path = require('path'),
	app = express().use(express.static(path.join(__dirname, 'public'))),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server, {
		log: false
	}),
	fs = require('fs'),
	os = require('os'),
	config = require('./config.json'),
	execFile = require('child_process').execFile,
	sbConfig = JSON.parse(fs.readFileSync(config.path + 'starbound.config'));

if (authenticate('pass123')) {
	console.log("PLEASE EDIT config.json AND REMOVE OR CHANGE THE DEFAULT PASSWORD");
}

server.listen(config.port);

app.get('/');

var global = initGlobal();
var starbound_server = startServer();
var regexp = {
	//runs a match on the line on all the regexps (except server, that only needs to run when the servers being started) and broadcasts to all sockets.
	tests: function(line) {
		var test;
		if (global.status !== 'up') {
			if (this.server.test(line)) {
				console.log("Server up.");
				io.sockets.emit('data', {
					status: 'up'
				});
				global.status = 'up';
			}
		}
		if (this.chat.test(line)) {
			//add line to chat log, emit to sockets
			test = line.match(this.chat);
			chatEvent({
				user: test[1],
				message: test[2]
			});

		} else if (this.world.test(line)) {
			test = line.match(this.world);
			//check if system is loading or unloading, and add or remove them from list, emit to sockets
			system = test[3] + ': ' + test[4] + ', ' + test[5];
			system = system.charAt(0).toUpperCase() + system.slice(1);
			systemEvent({
				type: test[1],
				system: system
			});

		} else if (this.user.test(line)) {
			test = line.match(this.user);
			//check if they disconnect or connect, and then add or remove them from list, emit to sockets
			userEvent({
				name: test[1],
				ip: test[2],
				type: test[3]
			});
		}
	},
	user: /^Info:\s+Client '(.*)' <\d> \((\d+.\d+.\d+.\d+):\d+\) ((dis)?connected)/,
	world: /^Info:\s+(Loading|Shutting down)\s?(world db for)?\sworld\s([\w]+):([-?\d]+):([-?\d]+):[-?\d]+:[-?\d]+:[-?\d]+/,
	chat: /^Info:\s+<(.*)>\s(.*)/,
	server: /^Info:\s+bind.*/
};

beginListener();

//socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('data', global);
	socket.on('exec', function(data) {
		if (authenticate(data.password)) {
			if ((data.type === 'stop' || data.type === 'restart') && global.status !== 'down') {
				io.sockets.emit('data', {
					status: 'down'
				});
				//kill process
				starbound_server.kill('SIGINT');
				console.log("Server stopped.");
				//reinitiate globals
				global = initGlobal();
			}
			if ((data.type === 'start' || data.type === 'restart') && global.status === 'down') {
				//start process
				starbound_server = startServer();
				beginListener();
			}
		} else {
			io.sockets.emit('wrongPassword', true);
		}
	});
});

function authenticate(password) {
	return config.password.indexOf(password) != -1;
}

function initGlobal() {
	var global = {
		status: 'down',
		users: [],
		systems: {},
		chatLog: [],
		logLength: 50,
		serverName: sbConfig.serverName
	};
	io.sockets.emit('data', global);
	return global;
}

function startServer() {
	console.log("Starting server...");
	io.sockets.emit('data', {
		status: 'starting'
	});
	global.status = 'starting';
	return execFile(config.path + platform(), function(error, stdout, stderr) {});
}

function platform() {
	if (os.platform() === 'win32') {
		return 'win32/starbound_server.exe';
	} else if (os.arch() === 'x64') {
		return 'linux64/starbound_server';
	} else {
		return 'linux32/starbound_server';
	}
}

function systemEvent(data) {
	console.log(data.type + ' a world in the ' + data.system + ' system.');
	if (data.type === 'Shutting down') {
		if (global.systems[data.system]) {
			global.systems[data.system].count -= 1;
			if (global.systems[data.system].count <= 0) {
				delete global.systems[data.system];
			}
		}

	} else if (data.type === 'Loading') {
		if (global.systems[data.system]) {
			global.systems[data.system].count += 1;
		} else {
			global.systems[data.system] = {
				name: data.system,
				count: 1
			};
		}

	}
	io.sockets.emit('system', data);
}

function chatEvent(data) {
	console.log('<' + data.user + '> ' + data.message);
	io.sockets.emit('chat', data);
	global.chatLog.push(data);
	if (global.chatLog.length > global.logLength) {
		global.chatLog.shift();
	}
}

function userEvent(data) {
	if (data.type === 'disconnected') {
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
		user: 'Server',
		message: 'User ' + data.name + ' has ' + data.type + '.'
	});
	io.sockets.emit('user', data);
}

function beginListener() {
	starbound_server.stdout.on('data', function(data) {
		regexp.tests(data);
	});
}