var questionEverySeconds = 7; //Could be a config value
var gameDurationInMinutes = 2; //Could be a config value

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
	},

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
			command:null,
			commandDuration: null,
			commandExpiration: null,
			strikes:0
		}}, {multi:true});
	},
	// End a game
	endGame: function(room_id) {
		if(Meteor.isClient) {
			Session('slampercent', 0);
		}
		Rooms.update(room_id, {$set:{state:'GAME_OVER'}});
		Users.update({room_id:room_id}, {$set:{
			command: null,
			commandDuration: null,
			commandExpiration: null
		}}, {multi: true});
	},

	// A user can submit a command, and it will clear out for users any in this room
	submitCommand: function(command, room_id) {
		return Users.update(
			{
				command:command,
				room_id: room_id
			},
			{$set:{
				command: null,
				commandDuration: null,
				commandExpiration: null
			}}, {multi:true}
		);
	},

	assignRandomWordToRoom: function(room_id) {
		var n = Dictionary.find().count();
		var r = Math.floor(Math.random() * n);
		var word = Dictionary.findOne({},{skip: r});

		Rooms.update(room_id, {$set:{word:word.Word}});
	}
});