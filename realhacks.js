

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function makehandle()
{
    var first = ['psycho','sexy','zero','dark','crazy','sneaky','silent','deadly','darth','insidious','circuit','net','web'];
    var second = ['killer','bunny','hacks','ninja','stunna','punk','rocker','cracker','jacker','hacker','splicer','slicer','babe','pony'];

    var raw = [
      first[Math.floor(Math.random()*first.length)], 
      second[Math.floor(Math.random()*second.length)]
    ].join('-');

    var leet = 'olzeasgtb';
    var numleet = Math.floor(Math.random()*4);

    for(var i = 0; i < numleet; i++) {
      var j = Math.floor(Math.random()*leet.length);
      raw = raw.replace(leet[j], j);
    }

    var numcaps = Math.floor(Math.random()*3)+1;
    var raw_a = raw.split('');
    for(var i = 0; i < numcaps; i++) {
      var index = Math.floor(Math.random()*raw_a.length)
      raw_a[index] = raw_a[index].toUpperCase(); 
    }
    raw = raw_a.join('');

    //Extras
    if(Math.random() < 0.2) {
      raw += Math.floor(Math.random() * 20 + 75);
    } else if(Math.random() < 0.05) {
      raw += '8===D~';
    } else if(Math.random() < 0.1) {
      raw = ['***', raw, '***'].join('');
    }

    return raw;
}

if (Meteor.isClient) {

  Session.set('commandpanelopen', 'NONE');

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
        urlid: makeid(),
        createdAt: new Date()
      });
    }
  });

if(Meteor.isClient) {
  var timeTick = new Tracker.Dependency();
  Meteor.setInterval(function () {
    timeTick.changed();
  }, 50);
}

  timeDiffReactive = function (time, duration) {
    timeTick.depend();
    var diff = time - (new Date().getTime());
    return diff/duration;
  }
  fromNowReactive = function (time) {
    timeTick.depend();
    var diff = time - (new Date().getTime());
    var minutes = Math.floor(diff/60000);
    var seconds = Math.floor((diff-minutes*60000)/1000);
    var milliseconds = Math.floor((diff-minutes*60000 - seconds*60));
    seconds = ('0'+seconds).substr(-2);
    milliseconds = ('00'+milliseconds).substr(-3);
    return [minutes, seconds, milliseconds].join(':');
  }
  hasPassed = function (time) {
    timeTick.depend();
    return time <= new Date().getTime();
  }

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
      return fromNowReactive(this.endsAt);
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
      return fromNowReactive(this.commandExpiration);
    },
    countdown_percent: function() {
      return Math.max(0, timeDiffReactive(this.commandExpiration, this.commandDuration) * 100);
    },
    verbpanel_class: function() {
      return Session.get('commandpanelopen')=='VERB'? 'open' : '';
    },
    objectpanel_class: function() {
      return Session.get('commandpanelopen')=='OBJECT'? 'open' : '';
    }
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

  // Template.RoomPage.onCreated(function(){
  //   var userid = Session.get('userid');
  //   var room_urlid = this.data.urlid;

  //   // console.log(userid);
  //   // console.log(room_urlid);


  //   if(userid) {

  //      Meteor.call('updateUser', userid, {
  //        room_urlid: room_urlid
  //      });

  //    } else {
  //     Tracker.autorun(function () {
  //        Meteor.call('updateUser', Session.get('userid'), {
  //          room_urlid: room_urlid
  //        });
  //     });
  //    }

  // });

  // Template.RoomPage.onDestroyed(function(){
  //    Meteor.call('updateUser', Session.get('userid'), {
  //      room_urlid: null
  //    });
  // });

  // Template.RoomPage.onCreated(function(){
  //   console.log('onCreated');
  //   Meteor.setInterval(keepAliveUser, 1000);
  // });
  // Template.RoomPage.onDestroyed(function(){
  //   console.log('onDestroyed');
  //   Meteor.clearInterval(keepAliveUser);
  // });

  Template.room.helpers({
    users: function() {
      return Users.find({room_urlid: this.urlid});
    }
  });

}

function keepAliveUser() {
    var user = Meteor.call('keepaliveUser', Session.get('userid'));
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}

if (Meteor.isClient) {
  Meteor.startup(function () {

      Meteor.call('newUser', { 
          handle: makehandle(),
          command_verbs: [
            'bust',
            'clear'
          ],
          command_objects: [
            'cache',
            'firewall'
          ]
        }, 
        function(error, id) {
          //console.log('usercreated');
          Session.set('userid', id)
        });

    Meteor.setInterval(keepAliveUser, 1000);

    window.onbeforeunload = function (e) {
      Meteor.call('deleteUser', Session.get('userid'));
    };

  });
}

/*
ar arr = []
while(arr.length < 8){
  var randomnumber=Math.ceil(Math.random()*100)
  var found=false;
  for(var i=0;i<arr.length;i++){
  if(arr[i]==randomnumber){found=true;break}
  }
  if(!found)arr[arr.length]=randomnumber;
}
document.write(arr);
*/