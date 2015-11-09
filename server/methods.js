var questionEverySeconds = 7; //Could be a config value

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
			state:'PLAYING',
			lastCommandIssuedAt:{$lt:questionDeadline}
			//endsAt:{$gt:utils.nowTicks()}
		});
		if(rooms.count()>0) { // Neccessary?
			rooms.forEach(function(room) {
				Meteor.call('issueCommandToRoom', room, questionEverySeconds);
			});
		}
	},

	// Issue a command to a room, with a countdown in seconds
	issueCommandToRoom: function(room, expiresInSeconds) {
		var i, users;

		// Apply strike and clear command info
		var user = Users.findOne({
			room_id: room._id,
			command: {$ne: null}
		});
		if(user) {
			Users.update(user._id, {$set:{
				command: null,
				commandDuration: null,
				commandExpiration: null,
				strikes: user.command? Math.min(3, user.strikes+1) : user.strikes
			}});
		}

		// Get eligible users in the room
		users = Users.find({
			room_id:room._id,
			strikes: {$lt: 3}
		});
		if(users.count() == 0) {
			Meteor.call('endGame', room._id);
			return;
		}

		// Pick a random user index
		var actorIndex = utils.rint(0, users.count()-1);
		// Pick another random user index (could be the same, for now)
		var recipientIndex = utils.rint(0, users.count()-1);
		
		var command;

		// Find the first user and construct a command they could execute
		// TODO: A better way to find my index?
		i = 0;
		users.forEach(function(user){
			if(i == actorIndex) {
				command = [
					utils.pickone(user.command_verbs).text,
					utils.pickone(user.command_objects).text
				].join(' the ');
			}
			i++;
		});

		// Set all the users data in this room...
		// TODO: A better way to find my index?
		i = 0;
		users.forEach(function(user){
			if(i==recipientIndex) {
				Users.update({_id: user._id}, {$set:{
					// Set recipient command text
					command: command,
					// Set recipient command duration
					commandDuration: expiresInSeconds*1000,
					// Set recipient command expiration
					commandExpiration: utils.nowTicks() + expiresInSeconds*1000
				}});
			}
			i++;
		});

		// Update the room so we don't run this method again for a bit
		Rooms.update(room._id, {$set: {
			lastCommandIssuedAt: utils.nowTicks()
		}})
	}
});