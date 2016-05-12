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

var sinon = require('sinon');
var assert = require('chai').assert;

var format = require('../lib/SysLogMessageFormatter');

suite('SysLogMessageFormatter', function(){
	var env;
	setup(function(){
		env = {
			WHATAMI: "Batman",
			container_uuid: "Bruce"
		};
	});

	suite('#format', function(){
		test('All messages should end with \\r\\n', function() {
			var result = format({message: "fire"});
			assert.isTrue(result.endsWith('\r\n'));
		});

		test('Should contain containerName', function() {
			var result = format({message: "fire"}, env);
			assert.isTrue(result.indexOf("cn[Batman]") != -1);
		});

		test('Should contain containerId', function() {
			var result = format({message: "fire"}, env);
			assert.isTrue(result.indexOf("ci[Bruce]") != -1);
		});
	});
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
