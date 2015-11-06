Router.configure({
	layoutTemplate: 'layout'
});

Router.route('/', function () {
	if(Meteor.isClient) {
		Meteor.call('updateUser', Session.get('userid'), {
			room_id: null
		});
	}
	this.render('lobbypage');
});

Router.route('/:_room_id', function () {
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