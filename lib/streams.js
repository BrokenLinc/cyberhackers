//UserStream = new Meteor.Stream('users');


/*

				CursorStream.emit('snapshot', {
					_id: my_cursor_id,
					data: my_entity.getSnapshot()
				});

	CursorStream.on('snapshot', function(snapshot) {
		//REMOVE: simulate lag by tossing out packets
		//if(Math.random()<0.5) return;

		//console.log(data);
		if(entities[snapshot._id]) {
			entities[snapshot._id].setSnapshot(snapshot.data);
		}
	});

	*/