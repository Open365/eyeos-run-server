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

var Process = function(command, loggerFactory, child_process) {
	this.process = null;
	this.command = command;
	this.loggerFactory = loggerFactory;
	this.child_process = child_process || require('child_process');
};

util.inherits(Process, EventEmitter);

Process.prototype.execute = function() {
	var args = this.command.split(' ');
	var command = args.splice(0, 1)[0];

	this.process = this.child_process.spawn(command, args);
	var logger = this.loggerFactory.getLoggerFor(command, this.process.pid);

	this.process.stdout.pipe(logger);
	this.process.stderr.pipe(logger);

	var self = this;
	this.process.on('close', function(code, signal) {
		var exitedProcess = {
			code: code,
			signal: signal,
			pid: self.process.pid,
			appName: command
		};
		self.emit('exit', exitedProcess);
	});
};

Process.prototype.kill = function(signal) {
	this.process.kill(signal);
};

module.exports = Process;
