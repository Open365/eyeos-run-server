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
var EyeosFS = require('../lib/EyeosFS');

suite('EyeosFS', function(){
	var sut, settings, timeout, fs, spy;

	setup(function(){
		settings = {
			mountpoint: '/some/mountpoint'
		};

		spy = sinon.spy();
		fs = {stat: sinon.stub()};
		timeout = sinon.stub();

		sut = new EyeosFS(settings, null, null, timeout, fs);
	});

	suite('#monitor', function(){
		test('Should emit error whenever stat fails', function(done){
			timeout.yields();
			fs.stat.yields({errno: 56});
			sut.on('error', function(){
				done();
			});
			sut.monitor();
		});
	});
});