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

var fs = require('fs');
var Gateway = require('../Gateway');

var GatewayResolver = function(settings, gateway) {
	this.settings = settings;
	this.gateway = gateway || new Gateway();
};

GatewayResolver.prototype.start = function(callback) {
	var self = this;
	this.gateway.get(function(err, gateway) {
		if (err) {
			callback(err);
			return;
		}

		var nameserver = 'nameserver ' + gateway + '\n';
		fs.writeFile(self.settings.gatewayResolver.resolvFile, nameserver, function(err) {
			if (err) {
				callback(err);
			}
			fs.appendFile(self.settings.gatewayResolver.hostsFile, gateway + " gateway", function(err) {
				callback(err);
			});
		});
	});
};

module.exports = GatewayResolver;