Template.roomdetails_debug.helpers({
	users: function() {
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
		return utils.fromNowReactive(this.endsAt);
	}
});

Template.roomdetails_debug.events({
	'click .start-game': function() {
		Meteor.call('startGame', this._id);
	},
	'submit .submit-command': function (event) {
		event.preventDefault();
		var command = event.target.command.value;

		Meteor.call('submitCommand', command, this._id);
	}
});