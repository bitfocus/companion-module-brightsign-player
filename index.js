var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.init_udp();

};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_udp();

};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 21075);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, thing should be good
		self.udp.on('data', function () {
			self.status(self.STATE_OK);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module is for the Brightsign players'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}
	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;

	var actions = {

		'PAUSE':	{ label: 'Pause' },
		'RESUME':	{ label: 'Resume' },
		'REBOOT':	{ label: 'Reboot' },
		'STOP':		{ label: 'Stop and freeze' },
		'STOPCL':	{ label: 'Stop and clear' },
		'PLAY': {
			label: 'Play and freeze',
			options: [{
				type: 'textinput',
				label: 'filename',
				id: 'filename'
			}]
		},
		'PLAYCL': {
			label: 'Play and clear',
			options: [{
				type: 'textinput',
				label: 'filename',
				id: 'filename'
			}]
		},
		'LOOP': {
			label: 'Loop',
			options: [{
				type: 'textinput',
				label: 'filename',
				id: 'filename'
			}]
		},
		'LOOPS': {
			label: 'Loop seamless (no audio in video)',
			options: [{
				type: 'textinput',
				label: 'filename',
				id: 'filename'
			}]
		},
		'SEARCH': {
			label: 'Check if file is present',
			options: [{
				type: 'textinput',
				label: 'filename',
				id: 'filename'
			}]
		},
		'VOLUME': {
			label: 'Set Volume in percentage',
			options: [{
				type: 'textinput',
				label: 'volume',
				id: 'volume',
				regex: self.REGEX_NUMBER
			}]
		},
                'CUSTOM': {
                        label: 'Custom command',
                        options: [{
                                type: 'textinput',
                                label: 'custom command',
                                id: 'custom'
                        }]
                }
	};
		self.setActions(actions);
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action){

		case 'PAUSE':
			cmd = 'PAUSE';
			break;

		case 'RESUME':
			cmd = 'RESUME';
			break;

		case 'REBOOT':
			cmd = 'REBOOT';
			break;

		case 'STOP':
			cmd = 'STOP';
			break;

		case 'STOPCL':
			cmd = 'STOPCL';
			break;

		case 'PLAY':
			if (opt.filename !== "") {
				cmd = 'PLAY '+opt.filename;
			} else {
				cmd = 'PLAY';
			}
			break;

		case 'PLAYCL':
			if (opt.filename !== "") {
				cmd = 'PLAYCL '+opt.filename;
			} else {
				cmd = 'PLAYCL';
			}
			break;

		case 'LOOP':
			if (opt.filename !== "") {
				cmd = 'LOOP '+opt.filename;
			} else {
				cmd = 'LOOP';
			}
			break;

		case 'LOOPS':
			if (opt.filename !== "") {
				cmd = 'LOOPS '+opt.filename;
			} else {
				cmd = 'LOOPS';
			}
			break;

		case 'SEARCH':
			if (opt.filename !== "") {
				cmd = 'SEARCH '+opt.filename;
			} else {
				cmd = 'SEARCH';
			}
			break;


		case 'VOLUME':
			cmd = 'VOLUME '+opt.volume;
			break;

                case 'CUSTOM':
                        cmd = opt.custom;
                        break;

	}

	if (cmd !== undefined ) {

		if (self.udp !== undefined ) {
			debug('sending',cmd,"to",self.config.host);

			self.udp.send(cmd);
		}
	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
