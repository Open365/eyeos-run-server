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

function PackageJsonReader() {

}

PackageJsonReader.prototype.readMicroservicesList = function (packageJsonPath, callback) {
    fs.readFile(packageJsonPath, function(err, packageJson) {
        if (err) {
            callback(err);
            return;
        }
        var json;
        try {
            json = JSON.parse(packageJson.toString());
            var microservices = json.microservices;
        } catch (err) {
            if (!err.code) err = {code:'MALFORMED'}
            callback(err);
            return;
        }
        if (!json.microservices) {
            callback({code: 'MISSING'});
            return;
        }
        callback(null, microservices);
    });
};

module.exports = PackageJsonReader;
