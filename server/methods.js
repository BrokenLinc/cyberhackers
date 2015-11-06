var questionEverySeconds = 10; //Could be a config value

Meteor.methods({
	deleteUser: function(id) {
		Users.remove(id);
	},
	issueCommandToRoom: function(room, expiresInSeconds) {
		var users = Users.find({room_id:room._id});
		var actorIndex = Math.floor(Math.random()*users.count());
		var recipientIndex = Math.floor(Math.random()*users.count());
		
		var i = 0;
		var command = 'test command '+ Math.floor(Math.random()*1000);
		users.forEach(function(user){
			if(i==actorIndex) {
				command = [
					user.command_verbs[Math.floor(Math.random()*user.command_verbs.length)],
					'the',
					user.command_objects[Math.floor(Math.random()*user.command_objects.length)]
					].join(' ');
			}
			i++;
		});

		i = 0;
		users.forEach(function(user){
			Users.update({_id: user._id}, {$set:{
				command: i==recipientIndex? command : '',
				commandDuration: i==recipientIndex? expiresInSeconds*1000 : null,
				commandExpiration: i==recipientIndex? utils.nowTicks() + expiresInSeconds*1000 : null,
				strikes: user.command? user.strikes+1 : user.strikes
			}});
			i++;
		});

		Rooms.update(room._id, {$set: {
			lastCommandIssuedAt: utils.nowTicks()
		}})
	},
	removeIdleUsers: function() {
		Users.remove({updatedAt:{$lt:utils.nowTicks() - 3000}}); //allow 3 seconds for lag
	},
	// kickIdleUsers: function() {
	// 	Users.update(
	// 		{updatedAt:{$lt:utils.nowTicks() - 3000}},
	// 		{$set:{room_id: null}},
	// 		{multi:true}
	// 	);
	// },
	endExpiredGames: function() {
		Rooms.update(
			{endsAt:{$lt:utils.nowTicks()}},
			{$set:{state:'GAME_OVER'}},
			{multi:true}
		);
	},
	issueCommandsToRooms: function() {
		var questionDeadline = utils.nowTicks() - 1000*questionEverySeconds;
		
		var rooms = Rooms.find({lastCommandIssuedAt:{$lt:questionDeadline}});
		if(rooms.count()>0) {
			rooms.forEach(function(room) {
				if(room.endsAt > utils.nowTicks()) {
					Meteor.call('issueCommandToRoom', room, questionEverySeconds);
				}
			});
		}
	}
});