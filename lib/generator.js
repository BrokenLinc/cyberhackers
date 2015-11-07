// Templates
var templates = {
	commandline: function() {
		return pickone([
			{text: 'sudo {action}'},
			{text: '{action}'},
			{text: 'sudo {action} {flag}'},
			{text: '{action} {flag}'},
			{auto:true, cssclass: 'status', 
				text: '{actioning} ...Done.'},
			{auto:true, cssclass: 'error', 
				text: '{ERROR}. could not {verb} {adjective} {noun}'}
		]);
	},
	ERROR: function() {
		return pickone([
			'ERROR',
			'ACCESS DENIED',
			'EAFILEINUSE',
			'FALSE PROTOCOL',
			'NO ENTRY',
			'INCORRECT ACCESS CODES'
		]);
	},
	action: function(){
		return pickone([
			'telnet {verb} {ip}:{port}',
			'{verb} {adjective} {noun}',
			'{verb} {noun} #{randomdigit}',
			'git {verb}',
			'run {exe}'
		]);
	},
	actioning: function(){
		return pickone([
			'{verbing} {adjective} {noun}',
			'{verbing} {noun} #{randomdigit}'
		]);
	},
	verb: function(){
		return pickone([
			'open',
			'close',
			'purge',
			'clean',
			'restart',
			'shutdown',
			'fire',
			'rebase',
			'configure',
			'empty',
			'flash',
			'flush',
			'promote',
			'proxy'
		])
	},
	verbing: function(){
		return pickone([
			'opening',
			'closing',
			'purging',
			'cleaning',
			'restarting',
			'shutting down',
			'firing',
			'rebasing',
			'reconfiguring',
			'emptying',
			'flashing',
			'flushing',
			'promoting',
			'proxying'
		])
	},
	adjective: function() {
		return pickone([
			'IP',
			'DNS',
			'WIN32',
			'master',
			'backup',
			'backdoor',
			'admin',
			'SSL',
			'FAT32',
			'FTP',
			'CPU',
			'RAM',
			'GPU',
			'PCI',
			'parallel',
			'128-bit',
			'5.0Gbps',
			'USB',
			'system',
			'system32',
			'x86'
		])
	},
	noun: function() {
		return pickone([
			'hard drive',
			'hardline',
			'mainframe',
			'router',
			'config',
			'server',
			'switch',
			'socket',
			'partition',
			'access',
			'pipeline',
			'pin',
			'port',
			'cable',
			'line',
			'softline',
			'database'
		])
	},
	randomdigit: function(){
		return randomint(0,9);
	},
	ip: function() {
		return [
			randomint(0,255),
			randomint(0,255),
			randomint(0,255),
			randomint(0,255)
		].join('.');
	},
	port: function() {
		return [
			randomdigit(),
			randomdigit(),
			randomdigit(),
			randomdigit()
		].join('');
	},
	flag: function() {
		return pickone([
			'-m',
			'--safe',
			'--dirty',
			'-c',
			'--input',
			'--hard',
			'--clean',
			'--reset',
			'--soft',
			'-v {randomdigit}',
			'--proxy {ip}',
			'--force',
			'--unsafe'
		]);
	},
	exe: function() {
		return pickone([
			'codecracker.exe',
			'backdoor.exe',
			'portsniffer.exe',
			'protocoltracker.v2.exe',
			'linetracer.exe',
			'hashtablelookup.exe',
			'WURM.exe',
			'remoteBOOTlogger.exe'
		]);
	},
	org: function() {
		return pickone([
			'CIA',
			'FBI',
			'MI6',
			'NSA',
			'FAA',
			'SI7'
		]);
	},
	modifer: null,

}


// Utilities
function randomdigit() {
	return randomint(0,9);
}
function generate(key) {
	return processanything(templates[key]());
}
function randomint(min, max) {
	return min + Math.floor(Math.random()*(max-min+1));
}
function pickone(array) {
	return array[Math.floor(Math.random()*array.length)];
}
function processanything(source) {
	if(typeof(source) == 'string') {
		return process(source);
	} else if(typeof(source) == 'object') {
		source.text = process(source.text);
		return source;
	}
}
function process(source) {
	var string = source;
	for(var i = 0; i < 1000; i++) {
		var matches = string.match(/{([^}]*)}/);
		if (!matches) return string;

		//strip off braces
		var matchkey = matches[1];
		//console.log(matchkey);
		var res = templates[matchkey]();
		string = string.replace(new RegExp('{'+matchkey+'}', 'g'), res);
	}
	return string;
}

generator = {
	templates: templates,
	generate: generate,
	process: process
}