var timers = {};

Meteor.startup(function(){
	var cursor = Enemies.find();

	if (cursor.count() == 0) return;

	cursor.forEach(function (doc) {
        start(doc._id);
    }); 
});

// Enemies.before.insert(function (userId, doc) {
// 	console.log(doc._id);
// });
// Enemies.before.remove(function (userId, doc) {
// 	console.log(doc._id);
// });

function start(id) {
	stop(id);
	timers[id] = Meteor.setInterval(function(){
		Meteor.call('enemyAction', id);
	}, utils.rint(4000,8000));
}

function stop(id) {
	if(timers[id]) {
		Meteor.clearInterval(timers[id]);
		delete timers[id];
	}
}

EnemyTimers = {
	start: start,
	stop: stop
};