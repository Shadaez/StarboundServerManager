var socket = io.connect('http://localhost');
socket.on('init', function(data){
	console.dir(data);
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