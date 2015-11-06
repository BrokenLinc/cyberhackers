Meteor.methods({
	newRoom: function(roomdata) {
		var existing_room = Rooms.findOne(roomdata._id);
		if(existing_room === undefined) {
			//console.log('should insert');
			Rooms.insert(roomdata);
		}
	},
	newUser: function(user) {
		user.updatedAt = new Date().getTime();
		var id = Users.insert(user);
		return id;
	},
	updateUser: function(id, user) {
		// console.log('updateUser');
		// console.log(user);
		user.updatedAt = new Date().getTime();
		Users.update(id, {$set: user});
		return id;
	},
	keepaliveUser: function(id) {
		Users.update(id, {$set: {updatedAt:new Date().getTime()}});
		return id;
	},
	startGame: function(room_id) {
		Rooms.update(room_id, {$set: {
			lastCommandIssuedAt: new Date().getTime(),
			// startedAt: new Date().getTime(),
			// duration: 4.2*60*1000,
			endsAt: new Date().getTime() + 4.2*60*1000,
			state:'PLAYING'
		}});
		Users.update({room_urlid: room_id}, {$set:{
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