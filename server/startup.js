
Meteor.startup(function () {
	var questionEverySeconds = 10;

	//Removed expired sessions
	Meteor.setInterval(function(){
		Meteor.call('removeIdleUsers');
		Meteor.call('endGames');
		
		var questionDeadline = new Date().getTime()-1000*questionEverySeconds;
		
		var rooms = Rooms.find({lastCommandIssuedAt:{$lt:questionDeadline}});
		if(rooms.count()>0) {
			rooms.forEach(function(room) {
				if(room.endsAt > new Date().getTime()) {
					Meteor.call('issueCommandToRoom', room, questionEverySeconds);
				}
			});
		}
	}, 1000);
});