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

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var request = require('request');
var fs = require('fs');

var Serf = function (child_process, settings, microserviceChecker) {
	this.child_process = child_process || require('child_process');
	this.settings = settings || require('../../settings.js');
};

util.inherits(Serf, EventEmitter);

Serf.prototype.start = function (callback) {
	var self = this;
	fs.exists('/var/run/docker.sock', function (exists) {
		var binary = self.settings.serf.binary;
		var args = self.settings.serf.start;
		var multinode = process.env.MULTINODE
		if(exists && multinode == 'true') {
			self._getSerfExternalPort(function (port) {
				var advertise_ip = process.env.SERF_ADVERTISE_IP || '172.17.42.1';
				args.push('-advertise', advertise_ip + ':' + port);
				var poolToJoin = process.env.DISCOVERY_POOL || '172.17.42.1:7946';
				var arrayPool = poolToJoin.split(',');
				var joinList = ' ';
				arrayPool.forEach(function (addrToJoin) {
					joinList = joinList + '-join ' + addrToJoin + ' ';
				});
				args.push(joinList);
				self._launchSerf(binary, args, callback);
			});
		} else {
			self._launchSerf(binary, args, callback);
		}
	});
};

Serf.prototype.stop = function () {
	this.child_process.exec(this.settings.serf.binary + ' ' + this.settings.serf.stop);
};

Serf.prototype._launchSerf = function (binary, args, callback) {
	var serf = this.child_process.spawn(binary, args);

	var self = this;
	serf.on('close', function(code){
		var error = new Error("Serf exited with code " + code);
		self.emit('error', error);
	});
	serf.on('error', function(err){
		self.emit('error', err);
	});


	if (serf && serf.stdout && serf.stderr) {
		var fs = require('fs');
		var logStream = fs.createWriteStream('/serf.log', {flags: 'a'});
		serf.stdout.pipe(logStream);
		serf.stderr.pipe(logStream);
	}

	callback();
};

Serf.prototype._getSerfExternalPort = function (callback) {
	this._getContainerInfo(function (rawData) {
		var data = JSON.parse(rawData);
		var port = data['NetworkSettings']['Ports']['7946/tcp']['0']['HostPort'];
		callback(port);
	});
};

Serf.prototype._getContainerInfo = function (callback) {
	var request_path = 'http://unix:/var/run/docker.sock:/containers/' + process.env.HOSTNAME + '/json';
	request(request_path, function (error, response, body) {
		if(error){
			throw error;
		}
		callback(body);
	});
};

module.exports = Serf;
