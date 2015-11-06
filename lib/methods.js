Meteor.methods({
	newRoom: function(room) {
		var existing_room = Rooms.findOne({urlid: room.urlid});
		if(existing_room === undefined) {
			//console.log('should insert');
			Rooms.insert(room);
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
	startGame: function(urlid) {
		Rooms.update({urlid: urlid}, {$set: {
			lastCommandIssuedAt: new Date().getTime(),
			// startedAt: new Date().getTime(),
			// duration: 4.2*60*1000,
			endsAt: new Date().getTime() + 4.2*60*1000,
			state:'PLAYING'
		}});
		Users.update({room_urlid: urlid}, {$set:{
			command:'',
			strikes:0
		}}, {multi:true});
	},
	submitCommand: function(command, room_urlid) {
		Users.update(
			{
				command:command,
				room_urlid: room_urlid
			},
			{$set:{command: null}},
			{multi:true}
		);
	}
});