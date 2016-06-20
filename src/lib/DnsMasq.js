/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var events = require('events');
var fs = require('fs');
var util = require('util');
var settings = require('../settings');

var DnsMasq = function (child_process, fs) {
	this.child_process = child_process || require('child_process');
	this.fs = fs || require('fs');
};

util.inherits(DnsMasq, events.EventEmitter);

DnsMasq.prototype.start = function () {
	var self = this;
	var hostsFile = settings.dnsmasq.hostsPath + settings.dnsmasq.hostsFile;

	var binary = 'dnsmasq';
	var args = ['-k', '--log-facility=/dnsmasq.log', '--resolv-file=' + settings.dnsmasq.resolvFile, '--addn-hosts=' + hostsFile];

	console.log('Starting dnsmasq: ' + binary + ' ' + args.join(' '));
	var dns = self.child_process.spawn(binary, args);

	dns.on('close', function (code) {
		var err = new Error("DnsMasq exited with code " + code);
		console.log(err);
		self.emit('error', err);
	});
	dns.on('error', function (err) {
		console.log("DnsMasq ERROR: " + err);
		//throw err;
	});

	this.fs.watch(settings.dnsmasq.hostsPath, {persistent: false}, function (event, file) {
// 		console.log("EVENT: " + event, "FILE: " + file);
		if (event !== 'rename') {
// 			console.log('Event is not rename, skipping reload');
			return;
		}
		if (file !== settings.dnsmasq.hostsFile) {
// 			console.log('modified file is not hosts.serf, skipping reload');
			return;
		}
		try {
			if (self.fs.statSync(settings.dnsmasq.hostsPath + '/' + file).size == 0) {
				console.log('NOT RELOADING BECAUSE OF SIZE');
				return;
			}
		} catch(e) {
			console.log('HOSTS CONFIGURATION FILE NOT FOUND, SKIPPING DNSMASQ RELOAD', e);
			return;
		}

// 		console.log("REALOADING dnsmasq");
		self.child_process.exec('pidof dnsmasq | xargs --no-run-if-empty kill -1');
	});
};

module.exports = DnsMasq;
