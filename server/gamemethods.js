Meteor.methods({

	joinRoom: function(userid, room_id) {
		return Users.update(userid, {$set:{
			room_id: room_id,
			isPlaying: false
		}});
	},

	newGame: function(room_id) {
		return Rooms.update(room_id, {$set:{state: 'PREGAME'}});
	},
	startGame: function(room_id) {
		var numUsers = Users.update({room_id:room_id}, {$set:{
			hp:config.base_hp,
			isPlaying: true
		}}, {multi:true});
		Enemies.remove({room_id:room_id});
		for(var i=1; i<=numUsers; i++){
			var id = Enemies.insert({
				room_id: room_id,
				handle: 'CIA Bot #'+utils.rint(10,99),
				hp: config.base_hp
			});
			EnemyTimers.start(id);
		}
		return Rooms.update(room_id, {$set:{
			state: 'PLAYING'
		}});
	},
	winGame: function(room_id) {
		//TODO
		removeTimersInRoom(room_id);
		return Rooms.update(room_id, {$set:{state: 'GAMEOVER_WON'}});
	},
	loseGame: function(room_id) {
		//TODO
		removeTimersInRoom(room_id);
		return Rooms.update(room_id, {$set:{state: 'GAMEOVER_LOST'}});
	},

	setTarget: function(userid, target) {
		return Users.update(userid, {$set: {target: target}});
	},
	harmTarget: function(userid, target) {
		if(Users.findOne(userid).hp<=0) return false;

		affectTarget(target, -1);
		return true;
	},
	helpTarget: function(userid, target) {
		if(Users.findOne(userid).hp<=0) return false;

		affectTarget(target, 1);
		return true;
	},

	enemyAction: function(enemy_id) {
		var room_id = Enemies.findOne(enemy_id).room_id;
		var user_ids = Users.find(
			{room_id: room_id, isPlaying: true, hp:{$gt:0}}
			).map(function(doc, index, cursor){
				return doc._id;
		});

		if(user_ids.length == 0) {
			Meteor.call('loseGame', room_id);
			return;
		}

		var index = utils.rint(0,user_ids.length-1);

		affectTarget({type:'USER', id:user_ids[index]}, -1);
	}

});

function affectTarget(target, hpchange) {
	var collection;

	if(target.type == 'ENEMY') collection = Enemies;
	if(target.type == 'USER') collection = Users;

	if(!collection) return;

	var doc = collection.findOne(target.id);
	var newhp = Math.min(Math.max(doc.hp + hpchange, 0), config.base_hp);
	collection.update(target.id, {$set:{hp: newhp}});

	// Did something die?
	if(doc.hp>0 && newhp<=0) {
		var numberAlive = collection.find({room_id: doc.room_id, hp:{$gt:0}}).count();
		if(numberAlive == 0) {
			if(target.type == 'ENEMY') Meteor.call('winGame', doc.room_id);
			if(target.type == 'USER') Meteor.call('loseGame', doc.room_id);
		}
	}
}

function removeTimersInRoom(room_id) {
	Enemies.find({room_id: room_id}).forEach(function(doc){
		EnemyTimers.stop(doc._id);
	});
}