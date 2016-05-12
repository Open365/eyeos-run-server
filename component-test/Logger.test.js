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

var LoggerFactory = require('../src/lib/LoggerFactory');
var SysLogDaemon = require('./SysLogDaemon');

suite('Logger', function() {
	var factory, sut, daemon, settings;

	setup(function() {
		settings = {
			logging: {
				syslog: {
					host: '127.0.0.1',
					port: 12398,
					type: 'tcp',
					maxConnectionRetry: 50
				},
				stdout: {
					enabled: true
				}
			}
		};

		factory = new LoggerFactory(settings);
	});

	teardown(function() {
	});

	suite('#connection', function() {
		test('should receive a message when conected and writting on the logger', function(done) {
			daemon = new SysLogDaemon(settings);
			daemon.listen(function() {
				factory.connect(function(err) {
					sut = factory.getLoggerFor("test", 999);
					daemon.on('messagesReceived', function() {
						assert.equal(daemon.messageCount, 1);
						factory.disconnect();
						daemon.close(done);
					});
					sut.write('a message');
					sut.end();
				});
			});
		});


		test('should buffer a write if it happens while the server is disconnected', function(done) {
			daemon = new SysLogDaemon(settings);
			factory.connect(function(err) {
				sut = factory.getLoggerFor("test", 999);
				sut.write("another message");
				sut.write("more messages");
				sut.write("A third message while the connection is down");
				setTimeout(function() {
					daemon.listen(function(err) {
						console.log("Listening again!");
						daemon.on('messagesReceived', function() {
							assert.equal(daemon.messageCount, 3);
							factory.disconnect();
							daemon.close(done);
						});
					});
				}, 1000);
			});
		});

		test("should error if the connection to syslog errors", function(done) {
			settings.logging.syslog.port = "9999"; // bad port
			factory = new LoggerFactory(settings);
			factory.connect(function(err) {
				if(err) {
					return done();
				}
				done(new Error())
			});
		});
	});
});
