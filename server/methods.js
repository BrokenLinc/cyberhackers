var questionEverySeconds = 10; //Could be a config value

Meteor.methods({

	// Delete users who haven't pinged in 3 seconds (to allow for a little lag)
	removeIdleUsers: function() {
		Users.remove({updatedAt:{$lt:utils.nowTicks() - 3000}});
	},

	// Set the game state of rooms to "GAME_OVER" if their end time has passed
	endExpiredGames: function() {
		Rooms.update(
			{endsAt:{$lt:utils.nowTicks()}},
			{$set:{state:'GAME_OVER'}},
			{multi:true}
		);
	},

	// Issue a new command to rooms that are due for one, if the game isn't over
	issueCommandsToRooms: function() {
		var questionDeadline = utils.nowTicks() - 1000*questionEverySeconds;
		
		var rooms = Rooms.find({
			lastCommandIssuedAt:{$lt:questionDeadline},
			endsAt:{$gt:utils.nowTicks()}
		});
		if(rooms.count()>0) { // Neccessary?
			rooms.forEach(function(room) {
				Meteor.call('issueCommandToRoom', room, questionEverySeconds);
			});
		}
	},

	// Issue a command to a room, with a countdown in seconds
	issueCommandToRoom: function(room, expiresInSeconds) {
		var i;

		// Get the users in the room
		var users = Users.find({room_id:room._id});
		// Pick a random user index
		var actorIndex = utils.rint(0, users.count()-1);
		// Pick another random user index (could be the same, for now)
		var recipientIndex = utils.rint(0, users.count()-1);
		
		var command = 'command error'; //default if something ever goes wrong

		// Find the first user and construct a command they could execute
		// TODO: A better way?
		i = 0;
		users.forEach(function(user){
			if(i == actorIndex) {
				command = [
					utils.pickone(user.command_verbs),
					utils.pickone(user.command_objects)
				].join(' the ');
			}
			i++;
		});

		// Set all the users data in this room...
		i = 0;
		users.forEach(function(user){
			Users.update({_id: user._id}, {$set:{
				// Set recipient command text, otherwise clear their command
				command: i==recipientIndex? command : '',
				// Set recipient command duration, otherwise clear it 
				commandDuration: i==recipientIndex? expiresInSeconds*1000 : null,
				// Set recipient command expiration, otherwise clear it 
				commandExpiration: i==recipientIndex? utils.nowTicks() + expiresInSeconds*1000 : null,
				// Give the user a strike if they still had a command lingering
				strikes: user.command? user.strikes+1 : user.strikes
			}});
			i++;
		});

		// Update the room so we don't run this method again for a bit
		Rooms.update(room._id, {$set: {
			lastCommandIssuedAt: utils.nowTicks()
		}})
	}
});