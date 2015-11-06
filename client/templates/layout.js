Template.layout.helpers({
	currentUser: function() {
		return Users.findOne({_id: Session.get('userid')});
	}
});