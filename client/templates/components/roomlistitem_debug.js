Template.roomlistitem_debug.helpers({
	users: function() {
		return Users.find({room_id: this._id});
	}
});