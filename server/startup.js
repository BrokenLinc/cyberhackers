Meteor.startup(function () {

	// "Game engine" on the server
	Meteor.setInterval(function(){
		Meteor.call('removeIdleUsers');
		Meteor.call('endExpiredGames');
		Meteor.call('issueCommandsToRooms');
	}, 500);

});