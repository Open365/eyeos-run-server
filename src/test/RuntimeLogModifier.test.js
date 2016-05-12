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
var PassThrough = require("stream").PassThrough;

var FileWatcher = require('../lib/FileWatcher');

var RuntimeLogModifier = require('../lib/RuntimeLogModifier');


suite('RuntimeLogModifier', function () {
    var filename;
    var watcher;
    var sut;
    var fakeData, fakeContent;
    var fakeLog;

    setup(function () {
        filename = "folderToWatch/fileToWatch";
        fakeData = {
            stdout: {
                enabled: true
            }
        };

        fakeContent = JSON.stringify(fakeData);

        fakeLog = new PassThrough();
        sinon.stub(fakeLog, 'pipe');
        sinon.stub(fakeLog, 'unpipe');
        watcher = new FileWatcher();
        sinon.stub(watcher, 'startWatching');
        watcher.startWatching.yields(null ,fakeContent);
        sut = new RuntimeLogModifier(filename, watcher);


    });
    suite("registerLogger", function() {
        setup(function() {

        });

        test("when called for the fist time should startWatching logger's file settings", function () {
            execute();
            sinon.assert.calledWithExactly(watcher.startWatching, filename, sinon.match.func);
        });


        test("when called for the second time it should not start watching again", function() {
            execute();
            execute();
            sinon.assert.calledOnce(watcher.startWatching)
        });

        test("when the settings change to enabled, the logger is unpiped then piped again", function() {
            execute();
            sinon.assert.calledOnce(fakeLog.unpipe);
            sinon.assert.calledOnce(fakeLog.pipe);
        });

        test("when the settings change to disabled, the logger is unpiped but not piped again", function() {
            fakeData.stdout.enabled = false;
            fakeContent = JSON.stringify(fakeData);
            watcher.startWatching.yields(null ,fakeContent);
            execute();
            sinon.assert.calledOnce(fakeLog.unpipe);
            sinon.assert.notCalled(fakeLog.pipe);
        });

        var execute = function() {
            sut.registerLogger(fakeLog);

        }
    });

    teardown(function () {
    });

});