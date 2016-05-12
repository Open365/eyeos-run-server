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

var MicroserviceChcker = require('../lib/MicroserviceChecker');
var PackageJsonReader = require('../lib/PackageJsonReader');
var CheckAvailability = require('eyeos-check-availability');

suite('MicroserviceChecker', function() {
    var sut, checkAvailability, jsonReader, depList, clock, settings;

    setup(function() {
        depList = ['service1', 'service2'];

        jsonReader = new PackageJsonReader();
        sinon.stub(jsonReader);
        jsonReader.readMicroservicesList.callsArgWith(1, null, depList);

        checkAvailability = new CheckAvailability();
        sinon.stub(checkAvailability);

        clock = sinon.useFakeTimers();

		settings = {
			maxRetries: 10,
			delayRetries: 1000
		};
        sut = new MicroserviceChcker(settings, jsonReader, checkAvailability);
    });

	teardown(function () {
        clock.restore();
	});

    suite('#init', function() {
        test('should read list of microservices', function() {
            sut.init();
            sinon.assert.calledWith(jsonReader.readMicroservicesList, '/var/service/package.json');
        });

        test('should emit initialized when no dependency list', function() {
            jsonReader.readMicroservicesList.callsArgWith(1, {code:'MISSING'}, depList);

            var spy = sinon.spy();
            sut.on('initialized', spy);
            sut.init();

            sinon.assert.calledOnce(spy);
        });

        test('should set the dependencyList', function() {
            sut.init();
            assert.deepEqual(depList, sut.dependencyList);
        });

        test('should call __check', function() {
            sinon.stub(sut, '__check');
            sut.init();
            sinon.assert.calledOnce(sut.__check);
            sut.__check.restore();
        });
    });

    suite('#__check', function() {
        test('should call microservicesList.check', function() {
            sut.dependencyList = ['service5'];
            sut.__check();

            sinon.assert.calledWith(checkAvailability.check, sut.dependencyList);
        });
        test('should emit initialized when dependencyList is ready', function() {
            checkAvailability.check.callsArgWith(1, null);

            var spy = sinon.spy();
            sut.on('initialized', spy);
            sut.__check();

            sinon.assert.calledOnce(spy);
        });
        test('should emit error when services are not ready', function() {
            checkAvailability.check.callsArgWith(1, 'error');

            var spy = sinon.spy();
            sut.on('error', spy);
            sut.__check();

            sinon.assert.calledOnce(spy);
        });
    });
});
