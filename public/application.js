var socket = io.connect('http://localhost'),
	Chat = document.getElementById('Chat');
liLength = document.getElementsByTagName('li')[0].scrollHeight;

function StarboundCtrl($scope) {
	$scope.chatLog = [];
	$scope.logLength;
	$scope.users = [];
	$scope.worlds = [];
	$scope.status = 'unknown';
	$scope.serverName = 'Starbound Server';

	//watches for chat change, when it changes move scroll down to emulate chat programs
	$scope.$watch('chatLog', function() {
		Chat.scrollTop += liLength;
	})
}

//jQuery
$(ready)

function ready() {
	var $Toggle = $('#Toggle'),
		$hidden = $('.hidden');
	$Toggle.click(function() {
		$hidden.slideToggle();
		if ($Toggle.text() === '-') {
			$Toggle.text('+')
		} else {
			$Toggle.text('-')
		}
	});
	$('button').click(function() {
		socket.emit('exec', {
			type: $(this).attr('name'),
			password: $(this).parent().find("input[name=rconPassword]").val()
		})
	})
}

//socket.io
socket.on('world', function(data) {
	angular.element('body').scope().$apply(function(scope) {
		if (data.type === 'Shutting down') {
			scope.worlds.splice(scope.worlds.indexOf(data.world), 1);
		} else if (data.type === 'Loading') {
			scope.worlds.push(data.world);
		}
	});
});

socket.on('user', function(data) {
	angular.element('body').scope().$apply(function(scope) {
		if (data.type === 'disconnected') {
			scope.users.splice(scope.users.indexOf(data), 1);
		} else {
			scope.users.push(data);
		}
	});
});

socket.on('chat', function(data) {
	angular.element('body').scope().$apply(function(scope) {
		scope.chatLog.push(data);
		if (scope.chatLog.length > scope.logLength) {
			scope.chatLog.shift();
		}
	});
});

socket.on('data', updateScope);

socket.on('disconnect', function() {
	updateScope({status: 'unknown'});
})


function updateScope(data){
	angular.element('body').scope().$apply(function(scope) {
		$.extend(scope, data)
	});
}