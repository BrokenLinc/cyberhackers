var gameDurationInMinutes = 2; //Could be a config value

Meteor.methods({

	// Create the room only if it doesn't exist.
	// Note: I didn't use upsert here because I don't want to overwrite anything
	newRoom: function(roomdata) {
		var existing_room = Rooms.findOne(roomdata._id);
		if(existing_room) {
			return existing_room._id;
		}

		return Rooms.insert(roomdata);
	},

	// Insert a new user
	newUser: function(user) {
		user.updatedAt = utils.nowTicks();
		return Users.insert(user);
	},

	// Update a user
	updateUser: function(id, user) {
		user.updatedAt = utils.nowTicks();
		return Users.update(id, {$set: user});
	},

	// Delete a user
	deleteUser: function(id) {
		Users.remove(id);
	},

	// Users are routinely purged for unactivity. This prevents it.
	keepaliveUser: function(id) {
		return Users.update(id, {$set: {updatedAt:utils.nowTicks()}});
	},

	// Start a game in a room, resetting user data and setting intial game values
	startGame: function(room_id) {
		Rooms.update(room_id, {$set: {
			lastCommandIssuedAt: utils.nowTicks(),
			endsAt: utils.nowTicks() + gameDurationInMinutes*60*1000,
			state:'PLAYING'
		}});
		Users.update({room_id: room_id}, {$set:{
			command:'',
			strikes:0
		}}, {multi:true});
	},
	// End a game
	endGame: function(room_id) {
		Rooms.update(room_id, {$set:{state:'GAME_OVER'}});
	},

	// A user can submit a command, and it will clear out for users any in this room
	submitCommand: function(command, room_id) {
		Users.update(
			{
				command:command,
				room_id: room_id
			},
			{$set:{command: null}},
			{multi:true}
		);
	}
});