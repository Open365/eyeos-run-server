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
var psTree = require('ps-tree');
var child_process = require('child_process');

/**
 * This class tests the entire autodiscovery stack when running in the same
 * container or host.
 *
 * This test is valid to assret that Serf, TagsToDns and dnsmasq are working
 * properly.
 *
 * @note: this assumes serf is in the path, and that it is run in an isolated
 * environment
 */
suite.skip('autodiscovery', function(){

	var serf1, serf2, runServer;

	setup(function(){
		var args = 'agent --discover=cluster -rpc-addr=127.0.0.1:7374 -bind=0.0.0.0:7947 -tag some_id=component:127.0.0.2 -node autodiscover_component_test_1'.split(' ');
		serf1 = child_process.spawn("serf", args);
		var args = 'agent --discover=cluster -rpc-addr=127.0.0.1:7375 -bind=0.0.0.0:7948 -tag some_id=component2:127.0.0.3 -node autodiscover_component_test_2'.split(' ');
		serf2 = child_process.spawn("serf", args);

		process.env.DEPENDENCY_FILE = __dirname + '/package.json';
	});

	teardown(function(done) {
		serf1.kill();
		serf2.kill();

		psTree(process.pid, function (err, children) {
			var kill = child_process.spawn('kill', ['-9'].concat(children.map(function (p) {return p.PID})))
			kill.on('exit', function() {
				done();
			});
		});

	});

	suite('#service discovery', function() {
		test('Should execute the fake-server only when component2 and component domains resolve', function(done) {
			this.timeout(10000);
			var runServerPath = fs.realpathSync(__dirname + '/../src/eyeos-run-server.js');
			var fakeService = fs.realpathSync(__dirname + '/fake-service.js');
			runServer = child_process.spawn(runServerPath, ['--serf', fakeService]);

			var found1, found2;
			runServer.stdout.on('data', function(data) {
				console.log(data.toString());
				if (data.toString().indexOf('addresses: 127.0.0.2') > -1) {
					found1 = true;
				}
				if (data.toString().indexOf('addresses: 127.0.0.3') > -1) {
					found2 = true;
				}
			});

			var interval = setInterval(function() {
				if (found1 && found2) {
					done();
					clearInterval(interval);
				}
			}, 100);
		});
	});
});
