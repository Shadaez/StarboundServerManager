var socket = io.connect('http://localhost');

function StarboundCtrl($scope) {
	$scope.chatLog = [],
	$scope.users = [],
	$scope.worlds = [],
	$scope.status = ''
}

socket.on('init', function(data){
	angular.element("body").scope().$apply(function(scope){
		scope.chatLog = data.chatLog;
		scope.users = data.users;
		scope.worlds = data.worlds;
		scope.status = data.status;
	});
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
			scope.users.splice(scope.users.indexOf(data.name), 1);
		} else {
			scope.users.push(data.name);
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
		status(data);
	});
});