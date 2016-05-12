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
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var stream = require("stream");
var Process = require('../lib/Process.js');

suite('Process', function(){
	var sut, child_process, loggerFactory, exitedProcess, pid;

	var process = new EventEmitter();
	var command = 'some command';
	var prog = 'some';
	var args = ['command'];
	setup(function(){
		pid = 99;

		loggerFactory = {
			getLoggerFor: function() {
				return sinon.stub(new stream.Writable());
			}
		};
		exitedProcess = {
			code: 11,
			signal: 'signal',
			pid: pid
		};
		process.stdout = sinon.stub(new stream.Readable());
		process.stderr = sinon.stub(new stream.Readable());
		process.pid = pid;

		child_process = {
			spawn: sinon.stub()
		};
		child_process.spawn.returns(process);

		sut = new Process(command, loggerFactory, child_process);
	});

	suite('#execute', function(){
		test('Should execute prog & args passed by arguments using child_process', function(){
			sut.execute();
			sinon.assert.calledWith(child_process.spawn, prog, args);
		});

		test('When process closes all streams, an exit event should be emitted', function (done) {
			sut.execute();
			sut.on('exit', function(exitedProcess) {
				done();
			});
			process.emit('close', exitedProcess.code, exitedProcess.signal);
		});
	});
});
