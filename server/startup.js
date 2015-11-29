Meteor.startup(function () {

	// "Game engine" on the server
	Meteor.setInterval(function(){
		Meteor.call('removeIdleUsers');
	}, 500);
	
});