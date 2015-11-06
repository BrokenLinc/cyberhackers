Meteor.startup(function () {

	Meteor.call('newUser', { 
			handle: utils.makehandle(),
			command_verbs: [
				'bust',
				'clear'
			],
			command_objects: [
				'cache',
				'firewall'
			]
		}, 
		function(error, id) {
			//console.log('usercreated');
			Session.set('userid', id)
		}
	);

	Meteor.setInterval(keepAliveUser, 1000);

	window.onbeforeunload = function (e) {
		Meteor.call('deleteUser', Session.get('userid'));
	};

	function keepAliveUser() {
			var user = Meteor.call('keepaliveUser', Session.get('userid'));
	}

});