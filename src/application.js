var socket = io.connect((window.location.hostname == 'localhost')? '127.0.0.1:' + window.location.port : window.location.host),
	liHeight = 16;

function StarboundCtrl($scope) {
	$scope.chatLog = [];
	$scope.logLength = 50;
	$scope.users = [];
	$scope.systems = {};
	$scope.status = 'unknown';
	$scope.serverName = 'Starbound Server';
	//watches for chat change, when it changes if you're at the bottom, move scroll down to emulate chat programs
	$scope.$watchCollection('chatLog', function() {
		var Chat = $('#Chat').find('ol')[0];
		if(Chat.scrollTop + Chat.clientHeight === Chat.scrollHeight){
			setTimeout(function(){
				Chat.scrollTop += Chat.clientHeight;
			}, 10);
		} 
	});
}

//jQuery
$(ready);

function ready() {
	var $Toggle = $('#Toggle'),
		$hidden = $('.hidden'),
		$Chat =  $('#Chat').find('ol')[0];
	$Chat.scrollTop = $Chat.scrollHeight;
	$Toggle.click(function() {
		$hidden.slideToggle();
		if ($Toggle.text() === '-') {
			$Toggle.text('+');
		} else {
			$Toggle.text('-');
		}
	});
	$('button').click(function() {
		socket.emit('exec', {
			type: $(this).attr('name'),
			password: $(this).parent().find("input[name=rconPassword]").val()
		});
	});

}

//socket.io
socket.on('system', function(data) {
	angular.element('body').scope().$apply(function(scope) {
		if (data.type === 'Shutting down') {
			if (scope.systems[data.system]) {
				scope.systems[data.system].count -= 1;
				if (scope.systems[data.system].count <= 0) {
					delete scope.systems[data.system];
				}
			}
		} else if (data.type === 'Loading') {
			if (scope.systems[data.system]) {
				scope.systems[data.system].count += 1;
			} else {
				scope.systems[data.system] = {
					name: data.system,
					count: 1
				};
			}
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
	updateScope({
		status: 'unknown'
	});
});

function updateScope(data) {
	angular.element('body').scope().$apply(function(scope) {
		$.extend(scope, data);
	});
}