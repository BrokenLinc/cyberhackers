Template.roompage.helpers({
	currentUser: function() {
		return utils.currentUser();
	},
	room: function () {
		return Rooms.findOne(this.room_id);
	},
	isPlaying: function() {
		return Rooms.findOne(this.room_id).state == 'PLAYING';
	}
});

Template.roompage.onCreated(function(){
	// Always start with command panel closed
	panelstate('NONE');
});

// Catch keypresses while on this page
Template.roompage.onRendered(function(){
	$(window).on('keydown', {room_id:this.data.room_id}, onKeyDown);
});
Template.roompage.onDestroyed(function(){
	$(window).off('keydown', onKeyDown);
});

function onKeyDown(e){
	if (e.which == 27) { // ESC key
		// If the verbs panel is open, close it
		// Otherwise open the verbs panel
		panelstate(panelstate() == 'OBJECT'? 'NONE' : 'OBJECT');
	} else if(e.which >= 49 && e.which <= 57) { // Keys 1 through 9
		var index = e.which - 49; // convert to 0 through 8 index
		var currentUser = utils.currentUser();

		if(panelstate() == 'OBJECT') {
			// Cache the first selection
			Session.set('commandobject', currentUser.command_objects[index]);
			// Proceed to next step
			panelstate('VERB');
		} else if(panelstate() == 'VERB') {
			// Construct the full command
			var command = [
				currentUser.command_verbs[index].text, 
				Session.get('commandobject').text
			].join(' the ');
			// Clear the previous cached selection
			Session.set('commandobject', null);
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