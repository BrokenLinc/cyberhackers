Template.userdetails_debug.helpers({
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