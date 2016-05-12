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
var path = require("path");
var mkdirp = require("mkdirp");
var fs = require("fs");

var FileWatcher = require('../lib/FileWatcher');


suite('FileWatcher', function () {
    var dir, name;
    var fileToWatch;
    var fakeContents;
    var sut;

    setup(function () {
        dir = "afakeDir";
        name = "aFakeFile";
        fileToWatch = path.join(dir, name);

        fakeContents = "fake file contents";

        sinon.stub(mkdirp, "sync");
        sinon.stub(fs, "watch");
        sinon.stub(fs, "readFile");

        sut = new FileWatcher(mkdirp, fs);


    });
    suite("startWatching", function() {
        setup(function() {
            fs.watch.yields("event", name);
            fs.readFile.yields(null, fakeContents);
        });

        test('when called should create watch folder if not exists ', function () {
            execute();
            sinon.assert.calledWithExactly(mkdirp.sync, dir);
        });

        test("when called should start watching the passed file's the parent directory ", function () {
            execute();
            sinon.assert.calledWith(fs.watch, dir);
        });

        test("when the watched file changes, should call the callback", function() {
            var cb = execute();
            sinon.assert.called(cb);
        });

        test("when another file in the same folder changes, the callback is not called", function() {
            fs.watch.yields("fakeEvent", "badname");
            var cb = execute();
            assert.isFalse(cb.called);
        });

        test("when the file changes, it is read", function() {
            var cb = execute();
            sinon.assert.calledWithExactly(fs.readFile, fileToWatch, cb);
        });

        test("when the file changes,the callback provided is called with its contents", function() {
            var cb = execute();
            sinon.assert.calledWithExactly(cb, null, fakeContents);
        });

        var execute = function() {
            var cb = sinon.spy();
            sut.startWatching(fileToWatch, cb);
            return cb;
        }
    });

    teardown(function () {
        mkdirp.sync.restore();
        fs.watch.restore();
        fs.readFile.restore();
    });

});