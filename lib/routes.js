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
	routeRoom(this, 'roompage');
});

// http://localhost:3000/debug/somestring123
Router.route('/debug/:_room_id', function () {
	routeRoom(this, 'roompage_debug');
});

function routeRoom(request, templateName) {
	// On the client, use the trailing string to create a new room
	// Then drop the user into it
	if(Meteor.isClient) {
		Meteor.call('newRoom', {
			_id: request.params._room_id,
			createdAt: new Date(),
			state: 'PREGAME'
		});
		Meteor.call('updateUser', Session.get('userid'), {
			room_id: request.params._room_id
		});
	}

	request.render(templateName, {data: {
		room_id: request.params._room_id
	}});
}