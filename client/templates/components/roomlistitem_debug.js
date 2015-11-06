Template.room.helpers({
	users: function() {
		return Users.find({room_id: this._id});
	}
});