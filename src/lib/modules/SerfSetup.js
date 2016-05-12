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

var mkdirp = require('mkdirp');
var fs = require('fs');

var SerfSetup = function(settings) {
	this.settings = settings;
};

SerfSetup.prototype.setup = function(callback) {
	var self = this;
	mkdirp(this.settings.dnsmasq.hostsPath, function(err) {
		if (err) {
			callback(err);
			return;
		}

		var fullHostsPath = self.settings.dnsmasq.hostsPath + self.settings.dnsmasq.hostsFile;
		fs.writeFile(fullHostsPath, new Buffer(0), function(err) {
			callback(err);
		});
	});
};

module.exports = SerfSetup;