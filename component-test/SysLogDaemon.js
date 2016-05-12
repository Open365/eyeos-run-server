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

var net = require('net');
var util = require("util");
var EventEmitter = require('events').EventEmitter;

var SysLogDaemon = function(settings) {
	this.server = net.createServer();
	this.messageCount = 0;
	this.connections = [];
	this.running = false;
	this.settings = settings;

	var self = this;
	this.server.on('connection', function(con) {
		self.connections.push(con);
		con.on('data', function(data) {
			var str = data.toString('utf8');
			var messages = str.trim().split('\r\n');
			self.messageCount += messages.length;
			self.emit('messagesReceived');
		});

		con.once('close', function() {
			var i = self.connections.indexOf(con);
			self.connections = self.connections.splice(i, 1);
		});
	});
};

util.inherits(SysLogDaemon, EventEmitter);

SysLogDaemon.prototype.listen = function(callback) {
	this.server.listen(this.settings.logging.syslog.port, callback);
	this.running = true;
};

SysLogDaemon.prototype.close = function(callback) {
	if (this.running === false) {
		if (typeof callback === 'function') {
			callback();
		}
		return;
	}

	this.running = false;
	this.connections.forEach(function(con) {
		con.end();
	});
	this.server.close(callback);
};

module.exports = SysLogDaemon;
