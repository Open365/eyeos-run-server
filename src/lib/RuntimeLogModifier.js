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

var FileWatcher = require("./FileWatcher");
var settings = require("../settings");

function RuntimeLogModifier (fileToWatch, fileWatcher) {
    this.fileToWatch = fileToWatch || settings.logging.logsRuntimeSettingsFile;
    this.watcher = fileWatcher || new FileWatcher();
    this.isWatching = false;
    this.loggers = [];
}

RuntimeLogModifier.prototype.registerLogger = function (logger) {
    this.loggers.push(logger);
    if (!this.isWatching) {
        this.isWatching = true;
        this.watcher.startWatching(this.fileToWatch, this._onFileChanged.bind(this))
    }
};

RuntimeLogModifier.prototype.onLostConnection = function() {
    this.loggers.forEach(function(logger) {
        logger.unpipe();

        // FIXME: What about the file changing dynamically?
        if (settings.logging.stdout.enabled) {
            logger.pipe(process.stdout);
        }
    });
};

RuntimeLogModifier.prototype._onFileChanged = function(err, content) {
    if(err) {
        console.error("Error reading settings file", err);
        return;
    }
    try {
        var newSettings = JSON.parse(content);
    } catch(e) {
        console.error("Error parsing settings file", e);
        return;
    }

    if(newSettings.stdout.enabled) {
        this.loggers.forEach(function(logger) {
            logger.unpipe(process.stdout);
            logger.pipe(process.stdout);
        });
    }
    else{
        this.loggers.forEach(function(logger) {
            logger.unpipe(process.stdout);
        });
    }

};

module.exports = RuntimeLogModifier;
