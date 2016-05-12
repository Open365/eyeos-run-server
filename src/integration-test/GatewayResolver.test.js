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
var fs = require('fs');
var Gateway = require('../lib/Gateway');
var GatewayResolver = require('../lib/modules/GatewayResolver');

suite('GatewayResolver', function(){
	var sut, gateway, settings;

	var resolvFile = __dirname + '/resolv.conf';
	var hostsFile = __dirname + '/hosts';

	function cleanTest() {
		try {
			fs.unlinkSync(resolvFile);
		} catch (err) {
		}
		try {
			fs.unlinkSync(hostsFile);
		} catch (err) {
		}
	}
	suiteSetup(function() {
		cleanTest();
	});

	setup(function(){
		gateway = new Gateway();
		sinon.stub(gateway);
		gateway.get.yields(null, '192.168.1.1');


		settings = {
			gatewayResolver: {
				resolvFile: resolvFile,
				hostsFile: hostsFile
			}
		};

		sut = new GatewayResolver(settings, gateway);
	});

	suiteTeardown(function() {
		cleanTest();
	});

	suite('#start', function(){
		test('Should set as resolver the gateway', function(done){
			sut.start(function() {
				assert.equal(fs.readFileSync(resolvFile).toString().indexOf('nameserver 192.168.1.1'), 0);
				done();
			});
		});
		test('Should set as resolver the gateway', function(done){
			sut.start(function() {
				assert.equal(fs.readFileSync(hostsFile).toString().indexOf('192.168.1.1 gateway'), 0);
				done();
			});
		});
	});
});