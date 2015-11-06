var timeTick;

function getTimeTick() {
  timeTick = timeTick || new Tracker.Dependency();
  Meteor.setInterval(function () {
    timeTick.changed();
  }, 50);
  return timeTick;
}
function nowTicks() {
  return new Date().getTime();
}


utils = {
  nowTicks: nowTicks,
  makeid:function ()
  {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 8; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  },
  makehandle:function ()
  {
      var first = ['psycho','sexy','zero','dark','crazy','sneaky','silent','deadly','darth','insidious','circuit','net','web'];
      var second = ['killer','bunny','hacks','ninja','stunna','punk','rocker','cracker','jacker','hacker','splicer','slicer','babe','pony'];

      var raw = [
        first[Math.floor(Math.random()*first.length)], 
        second[Math.floor(Math.random()*second.length)]
      ].join('-');

      var leet = 'olzeasgtb'; //012345678
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
  },

  timeDiffReactive:  function (time, duration) {
    getTimeTick().depend();
    var diff = time - nowTicks();
    return diff/duration;
  },
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
  hasPassed: function (time) {
    getTimeTick().depend();
    return time <= nowTicks();
  }
}