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

var Process = require('../lib/Process');
var ProcessUnion = require('../lib/ProcessUnion');
var ProcessFactory = require('../lib/ProcessFactory');

suite('ProcessUnion', function(){
	var sut, processes, logger, processFactory, process;

	setup(function(){
		process = new Process();
		process.execute = sinon.stub();
		logger = sinon.stub();
		processFactory = sinon.stub(new ProcessFactory());
		processes = ['ls', 'cwd'];

		processFactory.getProcess.returns(process);
		sut = new ProcessUnion(processes, logger, processFactory);
	});

	suite('#execute', function(){
		test('Should call this.processFactory.getProcess for each process', function() {
			sut.execute();
			sinon.assert.calledTwice(processFactory.getProcess);
		});
		test('Should pass the commands to processFactory', function () {
			sut.execute();
			sinon.assert.calledWith(processFactory.getProcess, 'ls', logger);
		});
		test('Should forward the exit signal of any child process', function (done) {
			sut.execute();
			sut.once('exit', function() {
				done();
			});

			process.emit('exit', {foo: 'bar'});
		});
		test('Should call .execute of the returned process', function () {
			sut.execute();
			sinon.assert.called(process.execute);
		});
	});
});