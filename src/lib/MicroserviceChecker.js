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

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var PackageJsonReader = require('./PackageJsonReader');
var CheckAvailability = require('eyeos-check-availability');

function MicroservicesChecker(settings, jsonReaderInjected, checkAvailabilityInjected) {
	this.settings = settings;
	this.jsonReader = jsonReaderInjected || new PackageJsonReader();
	this.checkAvailability = checkAvailabilityInjected || new CheckAvailability();
	this.dependencyList = [];
}

util.inherits(MicroservicesChecker, EventEmitter);

MicroservicesChecker.prototype.init = function() {
	var packageJsonPath = process.env.DEPENDENCY_FILE || '/var/service/package.json';
	var self = this;

	console.log('Max attempts', this.settings.maxRetries);
	console.log('reading dependencies form: ', packageJsonPath);
	this.jsonReader.readMicroservicesList(packageJsonPath, function(error, list) {
		if (error) {
			if (error.code === 'MALFORMED') {
				self.emit('error', error);
			} else if (error.code === 'MISSING') {
				console.log('Microservice dependency list is missing from package.json');
				self.emit('initialized');
				return;
			}
		}

		console.log("Checking microservices dependencies", list);
		self.dependencyList = list;
		self.__check();
	});
};

MicroservicesChecker.prototype.__check = function() {
	var self = this;
	this.checkAvailability.check(this.dependencyList, function(err) {
		if (err) {
			console.error("Some microservices failed to resolve: ", err);
			self.emit('error', 'Service initialization took too long');
			return;
		}

		console.log("all microsrevices are available");
		self.emit('initialized');
	}, this.settings.retryTime, this.settings.timeout);
};

module.exports = MicroservicesChecker;
