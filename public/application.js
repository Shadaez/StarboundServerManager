//lets add angular
var socket = io.connect('http://localhost');
var global = {};
socket.on('init', function(data){
	global = data; //we should refresh everything when we get this
});
socket.on('world', function(data){
	if (data.type === "Shutting down") {
		global.worlds.splice(global.clients.indexOf(data.world), 1);
	} else if (data.type === "Loading") {
		global.worlds.push(data.world);
	}
	console.log(data);
});

socket.on('client', function(data){
	if (data.type === "disconnected") {
		global.clients.splice(global.clients.indexOf(data.name), 1);
	} else {
		global.clients.push(data.name);
	}
});

socket.on('chat', function(data){
	global.chat.push("<" + data.name + "> " + data.message);
	if (global.chat.length > global.logLength) {
		global.chat.shift();
	}
	console.log(data);
});

socket.on('running', function(data){
	global.running = data;
	status(data);
});

$(ready);

function ready(){
	status(global.running);
};

//changes status depending on the value entered
function status(status){
	if(status === undefined){
		status = "unknown";
	}
	var options = {
		"unknown": {text: "unknown", color: "grey"},
		"up": {text: "up", color: "green"},
		"down": {text: "down", color: "red"},
		"starting": {text: "starting", color: "yellow"}
	};
	var properties = options[status];
	var $Status = $('#Status').find('i');
	$Status.text(properties.text);
	$Status.css("color", properties.color);
};