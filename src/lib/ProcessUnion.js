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

var ProcessFactory = require('./ProcessFactory');

var ProcessUnion = function(processes, loggerFactory, processFactory) {
	this.processes = processes;
	this.loggerFactory = loggerFactory;
	this.processFactory = processFactory || new ProcessFactory();
	this.executedProcesses = [];
};

util.inherits(ProcessUnion, EventEmitter);

ProcessUnion.prototype.execute = function() {
	var self = this;
	this.processes.forEach(function(process) {
		var proc = self.processFactory.getProcess(process, self.loggerFactory);
		self.executedProcesses.push(proc);
		proc.on('exit', function (process) {
			var index = self.executedProcesses.indexOf(this);
			if (index != -1) {
				self.executedProcesses.splice(index, 1);
			}
			self.emit('exit', process);
		});
		proc.execute();
	});
};

ProcessUnion.prototype.stop = function() {
	console.log('Sending SIGTERM to processes...');
	for(var i=0; i<this.executedProcesses.length; i++) {
		this.executedProcesses[i].kill();
	}
};

module.exports = ProcessUnion;

