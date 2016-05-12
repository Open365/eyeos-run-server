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

var util = require('util');
var events = require('events');
var FilesystemChecker = require('./FilesystemChecker');
var EyeosFSExec = require('./EyeosFSExec');
var ProcessFactory = require('./ProcessFactory');

var EyeosFS = function(settings, loggerFactory, logger, timeout, fs) {
	this.settings = settings;
	this.loggerFactory = loggerFactory;
	this.logger = logger;
	this.timeout = timeout || setTimeout;
	this.fs = fs || require('fs');
	this.processFactory = new ProcessFactory();
	this.childProcess = require('child_process');
};

util.inherits(EyeosFS, events.EventEmitter);

EyeosFS.prototype.start = function(callback) {
	var self = this;
	var fsexec = new EyeosFSExec(this.settings, this.loggerFactory, this.logger);
	fsexec.exec(function fsExecDone(err) {
		if (err) {
			callback(err);
			return;
		}

		var fsChecker = new FilesystemChecker();
		fsChecker.checkMountpoint(self.settings, function fsCheckDone(err) {
			if (err) {
				callback(err);
				return;
			}

			self.monitor();
			callback();
		});
	});
};

EyeosFS.prototype.monitor = function() {
	var self = this;
	this.timeout(function() {
		self.fs.stat('/mnt/eyeosFS/' + new Date().getTime(), function (error) {
			if (error && error.code !== "ENOENT") {
				console.log('eyeosFS healthcheck failed', error);
				self.emit('error', error);
				return;
			}
			self.monitor();
		});
	}, 1000);
};

EyeosFS.prototype.stop = function() {
	this.childProcess.exec('umount ' + this.settings.mountpoint);
	this.childProcess.exec('umount ' + this.settings.rawMountpoint);
};

module.exports = EyeosFS;
