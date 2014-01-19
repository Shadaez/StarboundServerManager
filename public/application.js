//lets add angular
var socket = io.connect('http://localhost');
var global = {};

function StarboundCtrl($scope) {
	$scope.chatLog = getModel("chatLog");
	$scope.users = getModel("users");
	$scope.worlds = getModel("worlds");
}

socket.on('init', function(data){
	global = data;
});

socket.on('world', function(data){
	if (data.type === "Shutting down") {
		global.worlds.splice(global.worlds.indexOf(data.world), 1);
	} else if (data.type === "Loading") {
		global.worlds.push(data.world);
	}
	console.log(data);
});

socket.on('user', function(data){
	if (data.type === "disconnected") {
		global.users.splice(global.users.indexOf(data.name), 1);
	} else {
		global.users.push(data.name);
	}
});

socket.on('chat', function(data){
	global.chatLog.push("<" + data.name + "> " + data.message);
	if (global.chatLog.length > global.logLength) {
		global.chatLog.shift();
	}
	console.log(data);
});

socket.on('running', function(data){
	global.running = data;
	status(data);
});

function getModel(model){
	return global[model];
}