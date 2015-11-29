Meteor.methods({

	// Create the room only if it doesn't exist.
	// Note: I didn't use upsert here because I don't want to overwrite anything
	newRoom: function(roomdata) {
		var existing_room = Rooms.findOne(roomdata._id);
		if(existing_room) {
			return existing_room._id;
		}

		return Rooms.insert(_.extend(
			{
				createdAt: new Date(),
				state: 'PREGAME'
			},
			roomdata
		));
	}

});