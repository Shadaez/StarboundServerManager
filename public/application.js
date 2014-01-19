var socket = io.connect('http://localhost');
var global = {};
socket.on('init', function(data){
	global = data;
});
socket.on('world', function(data){
	console.log(data);
});
socket.on('client', function(data){
	console.log(data);
});
socket.on('chat', function(data){
	console.log(data);
});
socket.on('running', function(data){
	console.log(data);
});

$(ready);

function ready(){

}

function status(status){
	$('#Header').text()
}