Template.userlistitem.helpers({
	cssclass: function() {
		return this.strikes >= 3? 'mod-danger' : '';
	},
	loopCount: function(count){
		var countArr = [];
		for (var i=0; i<count; i++){
			countArr.push({});
		}
		return countArr;
	}
});