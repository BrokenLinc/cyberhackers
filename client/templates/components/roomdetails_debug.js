Template.roomdebug.helpers({
	users: function() {
		return Users.find({room_urlid: this.urlid});
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

Template.roomdebug.events({
	'click .start-game': function() {
		Meteor.call('startGame', this.urlid);
	},
	'submit .submit-command': function (event) {
		event.preventDefault();
		var command = event.target.command.value;

		Meteor.call('submitCommand', command, this.urlid);
	},
	'keydown body': function(event) {
		console.log(event);
	}
});