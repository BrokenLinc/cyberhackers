Template.roomdetails.helpers({
	users: function() {
		// Get all the users in this room
		return Users.find({room_id: this._id});
	},
	isPregame: function() {
		return this.state == 'PREGAME';
	},
	isOver: function() {
		return this.state == 'GAME_OVER';
	},
	isPlaying: function() {
		return this.state == 'PLAYING';
	},
	countdown: function() {
		// Game timer
		return utils.fromNowReactive(this.endsAt);
	}
});

Template.roomdetails.events({
	'click .evt-startgame': function() {
		Meteor.call('startGame', this._id);
	}
});