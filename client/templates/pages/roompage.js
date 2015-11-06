Template.roompage.helpers({
	currentUser: function() {
		return Users.findOne({_id: Session.get('userid')});
	},
	room: function () {
		return Rooms.findOne(this.room_id);
	}
});

Template.roompage.onCreated(function(){
	Session.set('commandpanelopen', 'NONE');
});

Template.roompage.onRendered(function(){
	$(window).on('keydown', {room_id:this.data.room_id}, onRoomPageKeyDown);
});

Template.roompage.onDestroyed(function(){
	$(window).off('keydown', onRoomPageKeyDown);
});

function onRoomPageKeyDown(e){
	//console.log(e.data.room_urlid);
	//console.log(e.which);
	//49 to 57 // 1 to 9

	if (e.which == 27) { //ESC
		if (Session.get('commandpanelopen')=='VERB') {
			Session.set('commandpanelopen', 'NONE');
		} else {
			Session.set('commandpanelopen', 'VERB');
		}
	} else if(e.which >= 49 && e.which <= 57) {
		var index = e.which - 49;
		//console.log(index);
		var currentUser =  Users.findOne({_id: Session.get('userid')});
		if(Session.get('commandpanelopen')=='VERB') {
			Session.set('commandpanelopen', 'OBJECT');
			Session.set('commandverb', currentUser.command_verbs[index]);
		} else if(Session.get('commandpanelopen')=='OBJECT') {
			Session.set('commandpanelopen', 'NONE');
			var command = [Session.get('commandverb'), currentUser.command_objects[index]].join(' the ');
			Session.set('commandverb', null);

			Meteor.call('submitCommand', command, e.data.room_id);
		}
	}
}