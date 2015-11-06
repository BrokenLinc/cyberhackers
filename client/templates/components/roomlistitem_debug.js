  Template.room.helpers({
    users: function() {
      return Users.find({room_urlid: this.urlid});
    }
  });