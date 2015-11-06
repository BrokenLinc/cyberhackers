Template.lobbypage.helpers({
	rooms: function () {
		return Rooms.find();
	},
	users: function () {
		return Users.find({room_urlid: null});
	}
});

Template.lobbypage.events({
	'click .add-room': function () {
		Rooms.insert({
			_id: utils.makeid(),
			createdAt: new Date()
		});
	}
});