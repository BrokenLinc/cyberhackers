Meteor.startup(function () {

	// Client creates a new random user immediately
	Meteor.call('newUser', { 
			handle: utils.makehandle()
		}, 
		function(error, id) {
			Session.set('userid', id)
		}
	);

	Meteor.setInterval(keepAliveUser, 1000);

	// Delete the user immediately when closing the window
	window.onbeforeunload = function (e) {
		Meteor.call('deleteUser', Session.get('userid'));
	};

	function keepAliveUser() {
		Meteor.call('keepaliveUser', Session.get('userid'));
	}

});