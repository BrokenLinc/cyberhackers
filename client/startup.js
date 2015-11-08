Meteor.startup(function () {

	// Client creates a new random user immediately
	Meteor.call('newUser', { 
			handle: utils.makehandle(),
			command_verbs: generateUserVerbs(),
			command_objects: generateUserObjects()
		}, 
		function(error, id) {
			Session.set('userid', id)
		}
	);

	Meteor.setInterval(keepAliveUser, 1000);

	// Delete the user immediately when closing the window
	window.onbeforeunload = function (e) {
		Meteor.call('deleteUser', Session.get('userid'));
	};

	function keepAliveUser() {
			var user = Meteor.call('keepaliveUser', Session.get('userid'));
	}

});

function generateUserVerbs() {
	var a = randomSubset([
		{text:'fire', cssclass:'flame'}
	], 1);
	console.log(a);
	return a;
}

function generateUserObjects() {
	var a = randomSubset([
		{text:'firewall', cssclass:'wall'}
	], 1);
	console.log(a);
	return a;
}

function randomSubset(sourceArray, numberOfElements) {
	var arr = []
	while(arr.length < numberOfElements){
		var randomnumber=Math.floor(Math.random()*sourceArray.length)
		var found=false;
		for(var i=0;i<arr.length;i++){
			if(arr[i]==randomnumber){found=true;break}
		}
		if(!found)arr[arr.length]=randomnumber;
	}
	for(var i=0;i<arr.length;i++){
		arr[i] = sourceArray[arr[i]];
	}
	return arr;
}