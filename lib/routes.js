Router.configure({
	layoutTemplate: 'layout'
});

// http://localhost:3000
Router.route('/', function () {
	if(Meteor.isClient) {
		Meteor.call('updateUser', Session.get('userid'), {
			room_id: null
		});
	}
	this.render('lobbypage');
});

// http://localhost:3000/somestring123
Router.route('/:_room_id', function () {

	// On the client, use the trailing string to create a new room
	// Then drop the user into it
	if(Meteor.isClient) {
		Meteor.call('newRoom', {
			_id: this.params._room_id,
			createdAt: new Date(),
			state: 'PREGAME'
		});
		Meteor.call('updateUser', Session.get('userid'), {
			room_id: this.params._room_id
		});
	}

	this.render('roompage', {data: {
		room_id: this.params._room_id
	}});
});