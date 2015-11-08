Meteor.startup(function(){
	Session.set('consoleentries', [
		{text: 'Logging in...'},
		{text: 'Ready.'}
	]);
});

Template.userdetails.helpers({
	countdown: function() {
		return utils.fromNowReactive(this.commandExpiration);
	},
	countdown_percent: function() {
		return Math.max(0, utils.timeDiffReactive(this.commandExpiration, this.commandDuration) * 100);
	},
	verbpanel_class: function() {
		return Session.get('commandpanelopen')=='VERB'? 'state-open' : '';
	},
	objectpanel_class: function() {
		return Session.get('commandpanelopen')=='OBJECT'? 'state-open' : '';
	},
	consoleentries: function() {
		return Session.get('consoleentries');
	},
});

// Catch keypresses while on this page
Template.userdetails.onRendered(function(){
	$(window).on('keydown', {room_id:this.data.room_id}, onKeydown);
});
Template.userdetails.onDestroyed(function(){
	$(window).off('keydown', onKeydown);
});

function onKeydown(e){
	if (e.which === 27) return; // ESC key

	var consoleentries = Session.get('consoleentries');
	var lastLine = consoleentries[consoleentries.length-1];
	var textleft = lastLine.textleft;

	if(lastLine.textleft) {
		var chars = utils.rint(1,3);
		var nextchar = textleft.substr(0,chars);
		lastLine.text += nextchar;
		lastLine.textleft = textleft.substr(chars);
	} else {
		var line = generator.generate('commandline');
		if(!line.auto) {
			line.textleft = line.text;
			line.text = '';
		}
		consoleentries.push(line);
	}

	Session.set('consoleentries', consoleentries);
}