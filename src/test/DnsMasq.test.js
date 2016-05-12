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
var DnsMasq = require('../lib/DnsMasq.js');
var settings = require('../settings');

suite('DnsMasq', function () {
	var sut, childProcess, fs;
	var spawnedProcess;

	function SpawnedProcess () {
	}

	SpawnedProcess.prototype = Object.create(require('events').EventEmitter.prototype);

	setup(function () {
		spawnedProcess = new SpawnedProcess();

		childProcess = {
			spawn: sinon.spy(function () {
				return spawnedProcess;
			}),
			exec: sinon.stub()
		};
		fs = {
			watch: sinon.stub(),
			statSync: sinon.stub(),
			createWriteStream: sinon.stub()
		};

		sut = new DnsMasq(childProcess, fs);
	});

	suite('#start', function () {
		test('Should call child_process.spawn with the command', function () {
			sut.start();
			sinon.assert.calledWith(childProcess.spawn, 'dnsmasq');
		});

		test('Should watch hosts file', function () {
			sut.start();
			sinon.assert.calledWith(fs.watch, settings.dnsmasq.hostsPath);
		});

		test('Should emit error if dnsmasq exits', function (done) {
			sut.on('error', function () {
				done();
			});
			sut.start();
			spawnedProcess.emit('close', 'fake close code');
		});

		test('Should reload dnsmasq on file changes', function () {
			fs.watch.yields('rename', settings.dnsmasq.hostsFile);
			fs.statSync.returns({size: 1});
			sut.start();
			sinon.assert.calledWith(childProcess.exec, 'pidof dnsmasq | xargs --no-run-if-empty kill -1');
		});
	});
});
