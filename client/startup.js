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
		{text: 'blast',		cssclass:''},
		{text: 'burn',		cssclass:''},
		{text: 'clean',		cssclass:''},
		{text: 'clear',		cssclass:''},
		{text: 'close',		cssclass:''},
		{text: 'configure',	cssclass:''},
		{text: 'empty',		cssclass:''},
		{text: 'fire',		cssclass:''},
		{text: 'flash',		cssclass:''},
		{text: 'flush',		cssclass:''},
		{text: 'open',		cssclass:''},
		{text: 'overload',	cssclass:''},
		{text: 'promote',	cssclass:''},
		{text: 'proxy',		cssclass:''},
		{text: 'purge',		cssclass:''},
		{text: 'rebase',	cssclass:''},
		{text: 'restart',	cssclass:''},
		{text: 'rootkit',	cssclass:''},
		{text: 'scrub',		cssclass:''},
		{text: 'shutdown',	cssclass:''},
	], 6);
	console.log(a);
	return a;
}

function generateUserObjects() {
	var a = randomSubset([
		{text: 'host IP', 		cssclass:''},
		{text: 'DNS server', 	cssclass:''},
		{text: 'socket layer', 	cssclass:''},
		{text: 'backdoor', 		cssclass:''},

		{text: 'hard drive', 	cssclass:''},
		{text: 'master drive', 	cssclass:''},
		{text: 'backup drive', 	cssclass:''},

		{text: 'admin portal', 	cssclass:''},
		{text: 'SSL layer', 	cssclass:''},
		
		{text: 'CPU', 			cssclass:''},
		{text: 'mainframe CPU', cssclass:''},

		{text: 'RAM slots', 	cssclass:''},
		{text: 'PCI slots', 	cssclass:''},
		{text: 'parallel ports', cssclass:''},
		{text: 'USB ports', 	cssclass:''},

		{text: 'system root', 	cssclass:''},
		{text: 'auth token', 	cssclass:''},
	], 6);
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