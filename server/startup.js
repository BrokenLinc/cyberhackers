
Meteor.startup(function () {

	//Removed expired sessions
	Meteor.setInterval(function(){
		Meteor.call('removeIdleUsers');
		Meteor.call('endExpiredGames');
		Meteor.call('issueCommandsToRooms');
	}, 1000);
});