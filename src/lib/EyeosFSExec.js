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

var ProcessUnion = require('./ProcessUnion');

var EyeosFSExec = function(settings, loggerFactory, logger) {
	this.settings = settings;
	this.loggerFactory = loggerFactory;
	this.logger = logger;
};

EyeosFSExec.prototype.exec = function(callback) {
	var processUnion = new ProcessUnion([this.settings.notifyfs, this.settings.userDriveMounter], this.loggerFactory);
	processUnion.execute();
	var self = this;
	processUnion.on('exit', function (exitedProcess) {
		if (exitedProcess.code) {
			self.logger.write("[CRASH] Process " + exitedProcess.appName + " with code " + exitedProcess.code + "\n");
		}
		console.log("Exiting eyeos-run-server because eyeosfs process " + exitedProcess.appName + " died with code " + exitedProcess.code);
		process.exit(1);
	});

	callback();
};

module.exports = EyeosFSExec;
