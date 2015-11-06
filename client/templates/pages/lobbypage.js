Template.lobbypage.helpers({
	rooms: function () {
		return Rooms.find();
	},
	users: function () {
		return Users.find({room_id: null});
	}
});

Template.lobbypage.events({
	'click .evt-addroom': function () {
		Rooms.insert({
			_id: utils.makeid(),
			createdAt: new Date()
		});
	}
});