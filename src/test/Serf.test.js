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
var Serf = require('../lib/modules/Serf.js');

var util = require("util");
var EventEmitter = require("events").EventEmitter;

suite.skip('Serf', function () {
	var sut, childProces, startCallback, error, settings, childProcessObj;

	setup(function () {
		settings = {
			serf: {
				binary: 'serf-test',
				start: "agent --log-level=DEBUG -join 172.17.42.1 -event-handler=tagsToDns",
				stop: "leave"
			}
		};

		childProcessObj = new EventEmitter();

		error = new Error('Serf had an error');
		startCallback = sinon.stub();
		childProces = {
			spawn: sinon.spy(function() {
				return childProcessObj;
			}),
			exec: sinon.stub()
		};

		sut = new Serf(childProces, settings);
	});

	teardown(function () {

	});

	suite('#start', function () {
		test('Should call child_process.exec with a command', function () {
			sut.start(function(){});
			sinon.assert.calledWith(childProces.spawn, settings.serf.binary, settings.serf.start);
		});
	});

	suite('#monitoring', function(){
		test('Should emit error whenver the process closes', function() {
			var spy = sinon.spy();
			sut.on('error', spy);

			sut.start(function(){});
			childProcessObj.emit('close');

			sinon.assert.calledOnce(spy);
		});
		test('Should emit error whenever the process exists with error', function () {
			var spy = sinon.spy();
			sut.on('error', spy);

			sut.start(function(){});
			childProcessObj.emit('error');

			sinon.assert.calledOnce(spy);
		});
	});

	suite('#stop', function(){
		test("Should call child_process.exec with a command", function () {
			sut.stop();
			sinon.assert.calledWithExactly(childProces.exec, settings.serf.binary + ' ' + settings.serf.stop);
		});
	});
});
