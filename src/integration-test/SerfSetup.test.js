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
var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('chai').assert;
var SerfSetup = require('../lib/modules/SerfSetup.js');

suite('SerfSetup', function(){
	var sut, settings, hostsFile, fullPath;

	var workdir = __dirname + '/serfsetuptest/';

	suiteSetup(function() {
		rimraf.sync(workdir);
	});

	setup(function(){
		fullPath = workdir + hostsFile;
		settings = {
			dnsmasq: {
				hostsPath: workdir,
				hostsFile: hostsFile
			}
		};
		sut = new SerfSetup(settings);
	});

	suiteTeardown(function() {
		rimraf.sync(workdir);
	});

	suite('#setup', function(){
		test('Should create directory indicated in settings', function(done){
			sut.setup(function() {
				assert.ok(fs.statSync(workdir), 'directory should be created');
				done();
			});
		});
		test('Should NOT pass an error if directory already exists', function(done){
			sut.setup(function(err) {
				assert.notOk(err);
				done();
			});
		});
		test('Should create an empty file with the name of hostsFile in hostsPath', function (done) {
			sut.setup(function() {
				assert.equal(fs.statSync(fullPath).size, 0);
				done();
			});
		});
		test('Should truncate file to 0 size', function (done) {
			fs.writeFileSync(fullPath, 'some data');
			sut.setup(function() {
				assert.equal(fs.statSync(fullPath).size, 0);
				done();
			});
		});
	});
});