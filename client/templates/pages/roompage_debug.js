Template.roompage_debug.helpers({
	currentUser: function() {
		return utils.currentUser();
	},
	room: function () {
		return Rooms.findOne(this.room_id);
	},
	users: function() {
		// Get all the users in this room
		return Users.find({room_id: this.room_id});
	},
	enemies: function() {
		// Get all the enemies in this room
		return Enemies.find({room_id: this.room_id});
	},
});

Template.roompage_debug.events({
	'click .me-newgame': function() {
		Meteor.call('newGame', this.room_id);
	},
	'click .me-startgame': function() {
		Meteor.call('startGame', this.room_id);
	},
	'click .me-losegame': function() {
		Meteor.call('loseGame', this.room_id);
	},
	'click .me-wingame': function() {
		Meteor.call('winGame', this.room_id);
	},

	'click .me-enemy': function() {
		Meteor.call('setTarget', Session.get('userid'), {
			type: 'ENEMY',
			id: this._id
		})
	},
	'click .me-user': function() {
		Meteor.call('setTarget', Session.get('userid'), {
			type: 'USER',
			id: this._id
		})
	},

	'click .me-execute': function() {
		var user = utils.currentUser();

		if(!user.target) return;

		if(user.target.type == 'ENEMY') {
			Meteor.call('harmTarget', Session.get('userid'), user.target);
		} else if (user.target.type == 'USER') {
			Meteor.call('helpTarget', Session.get('userid'), user.target);
		}
	}
});