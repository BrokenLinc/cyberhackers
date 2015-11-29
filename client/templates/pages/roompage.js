Meteor.startup(function(){
	Session.set('consoleentries', [
		{text: 'Logging in...'},
		{text: 'Ready.'}
	]);
	Session.set('slampercent', 0);
});

Template.roompage.helpers({
	currentUser: function() {
		return Users.findOne(Session.get('userid'));
	},
	room: function () {
		return Rooms.findOne(this.room_id);
	},
	users: function() {
		// Get all the users in this room
		return Users.find({room_id: this.room_id});
	},
	players: function() {
		return Users.find({
			room_id: this.room_id,
			isPlaying: true
		});
	},
	enemies: function() {
		// Get all the enemies in this room
		return Enemies.find({room_id: this.room_id});
	},
	isGameOver: function() {
		return String(Rooms.findOne(this.room_id).state).split('_')[0] == 'GAMEOVER';
	},
	isGamePlaying: function() {
		return Rooms.findOne(this.room_id).state == 'PLAYING';
	}, 
	isPreGame: function() {
		return Rooms.findOne(this.room_id).state == 'PREGAME';
	},                                                                   //
	loopCount: function (count) {                                         // 28
		var countArr = [];                                                   // 29
		for (var i = 0; i < count; i++) {                                    // 30
			countArr.push({index:i});                                                  // 31
		}                                                                    //
		return countArr;                                                     // 33
	},
	hpbars: function (of, count) {                                         // 28
		var countArr = [];                                                   // 29
		for (var i = 0; i < of; i++) {                                    // 30
			countArr.push({index:i, cssClass:i<count? 'full' : 'empty'});                                                  // 31
		}                                                                    //
		return countArr;                                                     // 33
	},
	targetClass: function() {
		var target = Users.findOne(Session.get('userid')).target;
		return (target && (target.id==this._id))? 'mod-target' : '';
	},
	isGameWon: function() {
		return Rooms.findOne(this.room_id).state == 'GAMEOVER_WON';
	},
	isGameLost: function() {
		return Rooms.findOne(this.room_id).state == 'GAMEOVER_LOST';
	},
	hpClass: function() {
		return this.hp>0? '' : 'mod-dead';
	},
	consoleentries: function() {
		return Session.get('consoleentries');
	},
	slam_percent: function() {
		return Session.get('slampercent');
	},
});

Template.roompage.events({
	'click .me-newgame': function() {
		Meteor.call('newGame', this.room_id);
	},
	'click .me-startgame': function() {
		Meteor.call('startGame', this.room_id);
	},

	'click .me-enemy': function() {
		Session.set('slampercent', 0);
		Meteor.call('setTarget', Session.get('userid'), {
			type: 'ENEMY',
			id: this._id
		})
	},
	'click .me-user': function() {
		Session.set('slampercent', 0);
		Meteor.call('setTarget', Session.get('userid'), {
			type: 'USER',
			id: this._id
		})
	}
});

// Catch keypresses while on this page
Template.roompage.onRendered(function(){
	$(window).on('keydown', {room_id:this.data.room_id}, onKeydown);
});
Template.roompage.onDestroyed(function(){
	$(window).off('keydown', onKeydown);
});

function onKeydown(e){
	if (e.which === 32 || e.which < 65 || e.which > 90) return; // ESC key

	var consoleentries = Session.get('consoleentries');
	var lastLine = consoleentries[consoleentries.length-1];
	var textleft = lastLine.textleft;

	var slampercent = Session.get('slampercent')+1.5;
	if(slampercent>=100) {

		takeAction();

		slampercent = 0;
	}
	Session.set('slampercent', slampercent);

	if(lastLine.textleft) {
		var chars = 10; //utils.rint(1,5); //from 1 to 10 to 100
		var nextchar = textleft.substr(0,chars);
		lastLine.text += nextchar;
		lastLine.textleft = textleft.substr(chars);
	}
	if(!lastLine.textleft) {
		var line;
		while(!line || line.cssclass) {
			line = generator.generate('commandline');
			if(!line.auto) {
				line.textleft = line.text;
				line.text = '';
			}
			consoleentries.push(line);
		}
	}

	Session.set('consoleentries', consoleentries);
}

function takeAction() {	
	var user = utils.currentUser();

	if(!user.target) return;

	if(user.target.type == 'ENEMY') {
		Meteor.call('harmTarget', Session.get('userid'), user.target);
	} else if (user.target.type == 'USER') {
		Meteor.call('helpTarget', Session.get('userid'), user.target);
	}
}