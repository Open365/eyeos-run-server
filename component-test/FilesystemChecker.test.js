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
var FilesystemChecker = require('../src/lib/FilesystemChecker');

suite('FilesystemChecker', function(){
	var sut, settings, callback;

	setup(function(){
		settings = {
			retry: 1000,
			maxAttemps: 10,
			mountpoint: '/tmp/randomPath'
		};
		callback = sinon.spy();
		sut = new FilesystemChecker();
	});

	suite('#checkMountpoint', function(){
		test('Should call callback without error since / is always a mountpoint', function(done){
			settings.mountpoint = '/';
			sut.checkMountpoint(settings, function(error) {
				assert.notOk(error);
				done();
			})
		});
		test('Should call callback with error since the path does not exist', function (done) {
			settings.mountpoint = '/inventedPathRolf';
			settings.maxAttemps = 0;
			sut.checkMountpoint(settings, function(error) {
				assert.instanceOf(error, Error);
				done();
			})
		});
		test('Should attemp the mountpoint a few times', function (done) {
			settings.mountpoint = '/fff';
			setTimeout(function(){settings.mountpoint = '/';}, 1000);
			sut.checkMountpoint(settings, function(error) {
				assert.notOk(error);
				done();
			})
		});
	});
});