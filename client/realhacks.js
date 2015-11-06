

  Template.PageTemplate.helpers({
    currentUser: function() {
      return Users.findOne({_id: Session.get('userid')});
    }
  });

  Template.hello.helpers({
    rooms: function () {
      return Rooms.find();
    },
    users: function () {
      return Users.find({room_urlid: null});
    }
  });

  Template.hello.events({
    'click .add-room': function () {
      Rooms.insert({
        urlid: utils.makeid(),
        createdAt: new Date()
      });
    }
  });

  Template.RoomPage.helpers({
    currentUser: function() {
      return Users.findOne({_id: Session.get('userid')});
    },
    room: function () {
      return Rooms.findOne({urlid: this.urlid});
    }
  });

  Template.roomdebug.helpers({
    users: function() {
      return Users.find({room_urlid: this.urlid});
    },
    isPregame: function() {
      return this.state == 'PREGAME';
    },
    isOver: function() {
      return this.state == 'GAME_OVER';
    },
    isPlaying: function() {
      return this.state == 'PLAYING';
    },
    countdown: function() {
      return utils.fromNowReactive(this.endsAt);
    }
  });

  Template.roomdebug.events({
    'click .start-game': function() {
      Meteor.call('startGame', this.urlid);
    },
    'submit .submit-command': function (event) {
      event.preventDefault();
      var command = event.target.command.value;

      Meteor.call('submitCommand', command, this.urlid);
    },
    'keydown body': function(event) {
      console.log(event);
    }
  });

  Template.userdebug.helpers({
    countdown: function() {
      return utils.fromNowReactive(this.commandExpiration);
    },
    countdown_percent: function() {
      return Math.max(0, utils.timeDiffReactive(this.commandExpiration, this.commandDuration) * 100);
    },
    verbpanel_class: function() {
      return Session.get('commandpanelopen')=='VERB'? 'open' : '';
    },
    objectpanel_class: function() {
      return Session.get('commandpanelopen')=='OBJECT'? 'open' : '';
    }
  });

  Template.RoomPage.onCreated(function(){
    Session.set('commandpanelopen', 'NONE');
  });

  Template.RoomPage.onRendered(function(){

    $(window).on('keydown', {room_urlid:this.data.urlid}, onRoomPageKeyDown);
  });
  Template.RoomPage.onDestroyed(function(){
    $(window).off('keydown', onRoomPageKeyDown);
  });

  function onRoomPageKeyDown(e){
    //console.log(e.data.room_urlid);
    //console.log(e.which);
    //49 to 57 // 1 to 9

    if (e.which == 27) { //ESC
      if (Session.get('commandpanelopen')=='VERB') {
        Session.set('commandpanelopen', 'NONE');
      } else {
        Session.set('commandpanelopen', 'VERB');
      }
    } else if(e.which >= 49 && e.which <= 57) {
      var index = e.which - 49;
      //console.log(index);
      var currentUser =  Users.findOne({_id: Session.get('userid')});
      if(Session.get('commandpanelopen')=='VERB') {
        Session.set('commandpanelopen', 'OBJECT');
        Session.set('commandverb', currentUser.command_verbs[index]);
      } else if(Session.get('commandpanelopen')=='OBJECT') {
        Session.set('commandpanelopen', 'NONE');
        var command = [Session.get('commandverb'), currentUser.command_objects[index]].join(' the ');
        Session.set('commandverb', null);

        Meteor.call('submitCommand', command, e.data.room_urlid);
      }
    }
  }

  Template.room.helpers({
    users: function() {
      return Users.find({room_urlid: this.urlid});
    }
  });