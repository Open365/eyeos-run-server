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

var Gateway = function() {

};

Gateway.prototype.get = function(callback) {
	child_process.exec('sh -c \'route -ne\' | grep 0.0.0.0 | grep G | awk \'{ print $2 }\'', function (error, stdout, stderr) {
		var err;
		if (error) {
			err = new Error("Error happened while getting the gateway: " + error);
			console.log(err);
			return callback(err);
		}
		var gateway = stdout.split('\n')[0];
		if (!gateway || typeof gateway != "string" || gateway.length == 0) {
			return callback(new Error("Gateway not found"));
		}

		callback(null, gateway);
	});
};

module.exports = Gateway;
