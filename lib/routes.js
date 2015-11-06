Router.configure({
    layoutTemplate: 'PageTemplate'
});

Router.route('/', function () {
	if(Meteor.isClient) {
		Meteor.call('updateUser', Session.get('userid'), {
			room_urlid: null
		});
	}
	this.render('HomePage');
});

Router.route('/:_urlid', function () {
	if(Meteor.isClient) {
		Meteor.call('newRoom', {
			urlid: this.params._urlid,
        	createdAt: new Date(),
        	state: 'PREGAME'
		});
		Meteor.call('updateUser', Session.get('userid'), {
			room_urlid: this.params._urlid
		});
	}
	this.render('RoomPage', {data: {
		urlid: this.params._urlid
	}});
});