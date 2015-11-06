Meteor.methods({
	deleteUser: function(id) {
		Users.remove(id);
	},
	issueCommandToRoom: function(room, expiresInSeconds) {
		//console.log(room.urlid);
		//Users.update({room_urlid: room.urlid}, {$set: {command:'test command '+ Math.floor(Math.random()*1000)}});
		var users = Users.find({room_urlid:room.urlid});
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
				commandExpiration: i==recipientIndex? new Date().getTime() + expiresInSeconds*1000 : null,
				strikes: user.command? user.strikes+1 : user.strikes
			}});
			i++;
		});

		Rooms.update({urlid: room.urlid}, {$set: {
			lastCommandIssuedAt: new Date().getTime()
		}})
	},
	removeIdleUsers: function() {
		Users.remove({updatedAt:{$lt:new Date().getTime()-3000}});
	},
	kickIdleUsers: function() {
		Users.update(
			{updatedAt:{$lt:new Date().getTime()-3000}},
			{$set:{room_urlid: null}},
			{multi:true}
		);
	},
	endGames: function() {
		Rooms.update(
			{endsAt:{$lt:new Date().getTime()}},
			{$set:{state:'GAME_OVER'}},
			{multi:true}
		);
	}
});