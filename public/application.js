var socket = io.connect('http://localhost'),
	Chat = document.getElementById("Chat");
	liLength = document.getElementsByTagName('li')[0].scrollHeight;
function StarboundCtrl($scope) {
	$scope.chatLog = [];
	$scope.logLength;
	$scope.users = [];
	$scope.worlds = [];
	$scope.status = 'unknown';
	$scope.serverName = 'Starbound Server';

	//watches for chat change, when it changes move scroll down to emulate chat programs
	$scope.$watch('chatLog', function(){
		Chat.scrollTop += liLength;
	})
}

socket.on('init', function(data){
	angular.element("body").scope().$apply(function(scope){
		scope.chatLog = data.chatLog;
		scope.logLength = data.logLength;
		scope.users = data.users;
		scope.worlds = data.worlds;
		scope.status = data.status;
		scope.serverName = data.serverName;
	});
	Chat.scrollTop += Chat.scrollHeight;
});

socket.on('world', function(data){
	angular.element("body").scope().$apply(function(scope){
		if (data.type === "Shutting down") {
			scope.worlds.splice(scope.worlds.indexOf(data.world), 1);
		} else if (data.type === "Loading") {
			scope.worlds.push(data.world);
		}
		console.log(data);
	});
});

socket.on('user', function(data){
	angular.element("body").scope().$apply(function(scope){
		if (data.type === "disconnected") {
			scope.users.splice(scope.users.indexOf(data), 1);
		} else {
			scope.users.push(data);
		}
	});
});

socket.on('chat', function(data){
	angular.element("body").scope().$apply(function(scope){
		scope.chatLog.push(data);
		if (scope.chatLog.length > scope.logLength) {
			scope.chatLog.shift();
		}
		console.log(data);
	});
});

socket.on('status', function(data){
	angular.element("body").scope().$apply(function(scope){
		scope.status = data;
		console.log(data);
	});
});