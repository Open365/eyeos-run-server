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

var stream = require("stream");
var syslog2 = require("syslog2");
var fs = require("fs");
var settings = require("../settings");
var format = require("./SysLogMessageFormatter");
var RuntimeLogModifier = require("./RuntimeLogModifier");


function LoggerFactory(injectedSettings) {
    this.settings = injectedSettings || settings;
    this.syslog = syslog2;
    this.runtimeLogModifier = new RuntimeLogModifier();
}

LoggerFactory.prototype.connect = function(cb) {
    // Avoid using syslog
    // When syslog is not available, we buffer the messages until we can connect
    // and then finally we forward them or drop these messages. This buffer
    // can (and does) fill up when we have too many messages.
    // One fix would be to pipe the messages only after connect, but the syslog
    // library sucks and doesn't inform us about that
    return cb();

    /*
    var self = this;
    var reconnect = {
        enabled: true,
        maxTries: this.settings.logging.syslog.maxConnectionRetry,
        initialDelay: 1000,
        maxDelay: 1000
    };
    this.syslogLogger = this.syslog.create({connection: this.settings.logging.syslog, reconnect:reconnect}, cb);
    this.syslogLogger.on('error', function() {
        self.runtimeLogModifier.onLostConnection();
    });
    */
};

LoggerFactory.prototype.getLoggerFor = function(command, pid) {
    // DISABLE syslog temporarily
    return process.stdout;

    /*
    var logger = new stream.PassThrough();
    var syslogTransformer = new stream.Transform({objectMode: true});
    syslogTransformer._transform = function(chunk, encoding, done) {
        var message = format(chunk.toString());
        var data = {
            message: message,
            appName: command,
            pid: pid
        };
        done(null, data);
    };
    logger
        .pipe(syslogTransformer)
        .pipe(this.syslogLogger);

    if(this.settings.logging.stdout.enabled) {
        logger
            .pipe(process.stdout);
    }
    this.runtimeLogModifier.registerLogger(logger);
    return logger;
    */
};

LoggerFactory.prototype.disconnect = function() {
    //this.syslogLogger.end();
};

module.exports = LoggerFactory;
