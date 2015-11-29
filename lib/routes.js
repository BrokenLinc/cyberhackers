Router.configure({
	layoutTemplate: 'layout'
});

// http://localhost:3000
Router.route('/', function () {
	if(Meteor.isClient) {
		Meteor.call('exitRoom', Session.get('userid'));
	}
	this.render('lobbypage');
});

// http://localhost:3000/somestring123
Router.route('/:_room_id', function () {
	routeRoom(this, 'roompage');
});

// http://localhost:3000/somestring123/debug
Router.route('/:_room_id/debug', function () {
	routeRoom(this, 'roompage_debug');
});

function routeRoom(request, templateName) {
	// On the client, use the trailing string to create a new room
	// Then drop the user into it
	if(Meteor.isClient) {
		Meteor.call('newRoom', {
			_id: request.params._room_id
		});
		Meteor.call('joinRoom', Session.get('userid'), request.params._room_id);
	}

	request.render(templateName, {data: {
		room_id: request.params._room_id
	}});
}