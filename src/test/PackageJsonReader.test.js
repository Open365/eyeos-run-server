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

var PackageJsonReader = require('../lib/PackageJsonReader');

suite('PackageJsonReader', function() {
    var sut, packageJsonPath, microservicesListAssertion;

    setup(function() {
        microservicesListAssertion = [
            "proxy.service.consul",
            "rabbitmq.service.consul",
            "mongo.service.consul"
        ];
        packageJsonPath = 'example.package.json';
        sut = new PackageJsonReader(packageJsonPath);
    });

    suite('#readMicroservicesList', function() {
        test('should return the correct list of microservices', function(done) {
            sut.readMicroservicesList(packageJsonPath, function(err, list) {
                assert.deepEqual(list, microservicesListAssertion, 'Lists don\'t match');
                done();
            });
        });

        test('should return ENOENT error when path is incorrect', function(done) {
            sut.readMicroservicesList('package', function(err, list) {
                assert.equal(err.code, 'ENOENT', 'Error: Path seemd to be incorrect');
                done();
            });
        });

        test('should return MALFORMED error when packageJson is malformed', function(done) {
            sut.readMicroservicesList('README.md', function(err, list) {
                assert.equal(err.code, 'MALFORMED', 'Error: file is not a json valid file');
                done();
            });
        });

        test('should return MISSING error when packageJson is malformed', function(done) {
            sut.readMicroservicesList('package.json', function(err, list) {
                assert.equal(err.code, 'MISSING', 'Error: package.json does not have microservices list');
                done();
            });
        });
    });
});
