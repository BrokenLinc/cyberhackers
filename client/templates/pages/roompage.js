Template.roompage.helpers({
	currentUser: function() {
		return utils.currentUser();
	},
	room: function () {
		return Rooms.findOne(this.room_id);
	}
});

Template.roompage.onCreated(function(){
	// Always start with command panel closed
	panelstate('NONE');
});

// Catch keypresses while on this page
Template.roompage.onRendered(function(){
	$(window).on('keydown', {room_id:this.data.room_id}, onRoomPageKeyDown);
});
Template.roompage.onDestroyed(function(){
	$(window).off('keydown', onRoomPageKeyDown);
});

function onRoomPageKeyDown(e){
	if (e.which == 27) { // ESC key
		// If the verbs panel is open, close it
		// Otherwise open the verbs panel
		panelstate(panelstate() == 'VERB'? 'NONE' : 'VERB');
	} else if(e.which >= 49 && e.which <= 57) { // Keys 1 through 9
		var index = e.which - 49; // convert to 0 through 8 index
		var currentUser = utils.currentUser();

		if(panelstate() == 'VERB') {
			// Cache the first selection
			Session.set('commandverb', currentUser.command_verbs[index]);
			// Proceed to next step
			panelstate('OBJECT');
		} else if(panelstate() == 'OBJECT') {
			// Construct the full command
			var command = [Session.get('commandverb'), currentUser.command_objects[index]].join(' the ');
			// Clear the previous cached selection
			Session.set('commandverb', null);
			// Close the panels
			panelstate('NONE');
			// Send the command
			Meteor.call('submitCommand', command, e.data.room_id);
		}
	}
}

// Session management to make the above function more readable
function panelstate(setvalue) {
	if(setvalue) {
		Session.set('commandpanelopen', setvalue);
		return setvalue;
	}
	return Session.get('commandpanelopen');
}