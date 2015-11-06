var gameDurationInMinutes = 5; //Could be a config value

Meteor.methods({
	newRoom: function(roomdata) {
		var existing_room = Rooms.findOne(roomdata._id);
		if(existing_room === undefined) {
			//console.log('should insert');
			Rooms.insert(roomdata);
		}
	},
	newUser: function(user) {
		user.updatedAt = utils.nowTicks();
		var id = Users.insert(user);
		return id;
	},
	updateUser: function(id, user) {
		// console.log('updateUser');
		// console.log(user);
		user.updatedAt = utils.nowTicks();
		Users.update(id, {$set: user});
		return id;
	},
	keepaliveUser: function(id) {
		Users.update(id, {$set: {updatedAt:utils.nowTicks()}});
		return id;
	},
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