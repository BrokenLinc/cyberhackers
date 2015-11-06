Rooms = new Mongo.Collection("rooms");

Users = new Meteor.Collection('customUsers');


// if (Meteor.isClient) {
//   Accounts.ui.config({
//     passwordSignupFields: "USERNAME_ONLY"
//   });
// }

Meteor.methods({
	newRoom: function(room) {
		var existing_room = Rooms.findOne({urlid: room.urlid});
		if(existing_room === undefined) {
			//console.log('should insert');
			Rooms.insert(room);
		}
	},
	deleteUser: function(id) {
		Users.remove(id);
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
	submitCommand: function(command, room_urlid) {
		Users.update(
			{
				command:command,
				room_urlid: room_urlid
			},
			{$set:{command: null}},
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

if(Meteor.isServer){
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
}

//Room (Game)
//	users
//		strikes
//		command
//		commandExpiration
//	startTime
//	duration
//	lastCommandTime ** will be issued every X seconds, starting at 10, moving down to 3

// countdown bar on commands (using commandexpiration)

// don't allow users to join after game starts
// stop issuing commands after game is over
// bring in generator script(s) and use for commands, handles