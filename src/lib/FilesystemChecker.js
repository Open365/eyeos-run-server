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

var child_process = require('child_process');

var FilesystemChecker = function() {

};

FilesystemChecker.prototype.checkMountpoint = function(settings, callback) {
	var self = this;
	var attemps = 0;

	function checkMountpoint() {
		console.log("Checking mountpoint", settings.mountpoint);
		child_process.exec('mountpoint ' + settings.mountpoint, function(error) {
			attemps++;
			if (error) {
				if (attemps > settings.maxAttemps) {
					callback(new Error('Max amount of attemps reached waiting for mountpoint'));
				} else {
					setTimeout(checkMountpoint, settings.retry)
				}
				return;
			}

			callback();
		});
	}

	checkMountpoint();
};

module.exports = FilesystemChecker;