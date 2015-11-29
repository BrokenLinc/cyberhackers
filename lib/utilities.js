// On-demand tracker for 30fps updates
// TODO: consider using requestAnimationFrame instead of setInterval for performance
var timeTick;
function getTimeTick() {
	if(!timeTick) {
		timeTick = new Tracker.Dependency();
		Meteor.setInterval(function () {
			timeTick.changed();
		}, 33);
	}
	return timeTick;
}

// Easier to read shorthand for getting "now" in milliseconds
function nowTicks() {
	return new Date().getTime();
}

// Return a random integer between two values (inclusive)
function rint(min, max) {
	return Math.floor(Math.random()*(max-min+1)) + min;
}

// Return a random element from an array
function pickone(array) {
	return array[rint(0,array.length-1)];
}


utils = {
	nowTicks: nowTicks,
	rint: rint,
	pickone: pickone,

	//Generate a short "id" for url obfuscation
	makeid:function ()
	{
		var num_characters = 8;
		var text = "";
		var possible_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split('');

		for( var i=0; i < num_characters; i++ ) {
			text += pickone(possible_characters);
		}

		return text;
	},
	makehandle:function ()
	{
			// Generate a two-part name for starters
			var first = ['psycho','sexy','zero','dark','crazy','sneaky','silent','deadly','darth','insidious','circuit','net','web'];
			var second = ['killer','bunny','hacks','ninja','stunna','punk','rocker','cracker','jacker','hacker','splicer','slicer','babe','pony'];
			var raw = [
				pickone(first),
				pickone(second)
			].join('-');

			// Replace some letters with leetspeak numbers
			var leet = 'olzeasgtb'; //012345678
			var numleet = Math.floor(Math.random()*4);
			for(var i = 0; i < numleet; i++) {
				var j = Math.floor(Math.random()*leet.length);
				raw = raw.replace(leet[j], j);
			}

			// Capitalize some letters to similate cRaZinEsS
			var numcaps = Math.floor(Math.random()*3)+1;
			var raw_a = raw.split('');
			for(var i = 0; i < numcaps; i++) {
				var index = Math.floor(Math.random()*raw_a.length)
				raw_a[index] = raw_a[index].toUpperCase(); 
			}
			raw = raw_a.join('');

			// Extra suffixes
			if(Math.random() < 0.2) {
				// Cheesy years people used to add to the end of screennames
				raw += rint(74, 98); 
			} else if(Math.random() < 0.05) {
				// A cock
				raw += '8===D~';
			} else if(Math.random() < 0.1) {
				// Stars
				raw = ['***', raw, '***'].join('');
			}

			return raw;
	},

	// Reactive progress bars
	timeDiffReactive:  function (time, duration) {
		getTimeTick().depend();
		return (time - nowTicks())/duration;
	},

	// Reactive "m:ss" style countdowns
	fromNowReactive: function (time) {
		getTimeTick().depend();
		var diff = time - nowTicks();
		var minutes = Math.floor(diff/60000);
		var seconds = Math.floor((diff-minutes*60000)/1000);
		var milliseconds = Math.floor((diff-minutes*60000 - seconds*60));
		seconds = ('0'+seconds).substr(-2);
		milliseconds = ('00'+milliseconds).substr(-3);
		return [minutes, seconds, milliseconds].join(':');
	},

	// Reactive deadline
	hasPassed: function (time) {
		getTimeTick().depend();
		return time <= nowTicks();
	},

	// Shorthand to get the current user from session
	currentUser: function() {
		return Users.findOne(Session.get('userid'));
	},

	// Shorthand to get the current user's target from session
	currentTarget: function() {
		return utils.currentUser().target || {};
	}
}