Meteor.methods({

	// Delete users who haven't pinged in 3 seconds (to allow for a little lag)
	removeIdleUsers: function() {
		Users.remove({updatedAt:{$lt:utils.nowTicks() - 3000}});
	},

	// Insert a new user
	newUser: function(user) {
		user.updatedAt = utils.nowTicks();
		return Users.insert(_.extend(
			{hp:config.base_hp},
			user
		));
	},

	// Update a user
	updateUser: function(id, user) {
		user.updatedAt = utils.nowTicks();
		return Users.update(id, {$set: user});
	},

	// Delete a user
	deleteUser: function(id) {
		Users.remove(id);
	},

	// Users are routinely purged for unactivity. This prevents it.
	keepaliveUser: function(id) {
		return Users.update(id, {$set: {updatedAt:utils.nowTicks()}});
	}

});