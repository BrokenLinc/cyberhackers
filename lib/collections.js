// Users are stored as "customUsers" so as not to 
// conflict with a possible future implementation of 
// Meteor accounts

Users = new Meteor.Collection('customUsers');
Rooms = new Mongo.Collection("rooms");