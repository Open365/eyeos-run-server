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

var nopt = require("nopt");
var noptUsage = require("nopt-usage");
var async = require('async');
var settings = require('../settings');
var knownOpts = require('./nopt/knownOpts.js');
var shortHands = require('./nopt/shortHands.js');
var description = require('./nopt/description.js');
var defaults = require('./nopt/defaults.js');
var ProcessUnion = require('./ProcessUnion.js');
var LoggerFactory = require('./LoggerFactory.js');
var Serf = require('./modules/Serf.js');
var SerfSetup = require('./modules/SerfSetup.js');
var MicroserviceChecker = require('./MicroserviceChecker');
var GatewayResolver = require('./modules/GatewayResolver.js');
var DnsMasq = require('./DnsMasq.js');


var Main = function () {
	this.services = null;
	this.serf = null;
	this.loggerFactory = null;
	this.logger = null;
};


Main.prototype.start = function start () {
	var self = this;
	var usage = noptUsage(knownOpts, shortHands, description, defaults);
	var parsed = nopt(knownOpts, shortHands, process.argv, 2);

	var functions = [];

	functions.push(this.startLogger.bind(this));

	if (parsed['gateway-resolver']) {
		functions.push(this.gatewayResolver.bind(this));
	}

	if (parsed.serf) {
		functions.push(this.setupSerf.bind(this));
	}

	if (!parsed['skip-dnsmasq'] && parsed.serf) {
		functions.push(this.startDnsMasq.bind(this));
	} else {
		console.log("eyeos-run-server: Skipping launching of dnsmasq as demanded")
	}

	if (parsed.serf) {
		functions.push(this.startSerf.bind(this));
	}

	if (parsed.serf || parsed['gateway-resolver']) {
		functions.push(this.startMicroserviceChcecker.bind(this));
	}
	functions.push(function (logger) {
		self.startServices(parsed.argv.remain, logger);
	});

	if (parsed.umask) {
		var umask = parsed.umask;
		var oldumask = process.umask(umask);
		console.log("Changing umask from " + oldumask.toString(8) + " to " + umask);
	}

	async.waterfall(functions);
};

Main.prototype.stop = function stop (exitCode) {
	if (!exitCode) {
		exitCode = 0;
	}
	console.log("scheduling exit");
	if (this.services) {
		console.log("Stopping services");
		this.services.stop();
	}
	console.log("AFTER SERVICES STOP");
	if (this.serf) {
		console.log("STOPPING SERF");
		this.serf.stop();
	}
	console.log("BEFORE SETTIMEOUT");
	setTimeout(function () {
		console.log("QUITTING");
		var error = new Error("QUITTING, this exception is to force V8/node to forcefully quit");
		throw error;
	}, 1000);

};

Main.prototype.startLogger = function startLogger (callback) {
	var self = this;
	console.log("Starting LoggerFactory...");

	if(!settings.logging.stdout.enabled) {
		console.info("*************************************************************************");
		console.info("*                                WARNING                                *");
		console.info("* Logging to stdout is disabled. Applications won't log to docker logs. *");
		console.info("* Change the setting using 'eyeos stdout-logging enable' and try again! *");
		console.info("*                                                                       *");
		console.info("*************************************************************************");

	}

	var loggerFactory = new LoggerFactory();
	loggerFactory.connect(function (err) {
		self.loggerFactory = loggerFactory;
		self.logger = loggerFactory.getLoggerFor(process.argv[0], process.pid);
		if (err) {
			console.log("LoggerFactory could not connect. Retrying in the background.", err);
		} else {
			console.log('LoggerFactory started');
		}
		callback(null);
	});
};

Main.prototype.gatewayResolver = function(callback) {
	console.log('Gateway resolver');
	var self = this;
	var gatewayResolver = new GatewayResolver(settings);
	gatewayResolver.start(function(err) {
		if (err) {
			console.log('Setting up gateway-resolver', err);
			self.handleExit(1);
			return;
		}

		callback(null);
	});
};

Main.prototype.setupSerf = function( callback) {
	console.log("Starting serfSetup...");

	var self = this;
	this.serfSetup = new SerfSetup(settings);
	this.serfSetup.setup(function(err) {
		if (err) {
			console.log('Setting up serf failed', err);
			self.handleExit(1);
			return;
		}

		callback(null);
	});
};


Main.prototype.startSerf = function startSerf ( callback) {
	console.log("Starting serf...");
	var self = this;
	this.serf = new Serf();
	this.serf.start(function (error) {
		console.log("Starting the process");
		callback(null);
	});

	this.serf.on('error', function (error) {
		console.log("serf error:", error);
		self.handleExit(1);
	});
};

Main.prototype.startMicroserviceChcecker = function(callback) {
	var self = this;
	var microserviceChecker = new MicroserviceChecker(settings.microServiceChecker);
	microserviceChecker.init();
	microserviceChecker.once('initialized', function(){
		callback(null);
	});
	microserviceChecker.once('error', function(error) {
		console.log("Not executing processes because some dependencies falied:", error);
		self.handleExit(1);
		return;
	});
};


Main.prototype.startDnsMasq = function startDnsMasq (callback) {
	console.log("Starting dnsmasq...");
	var self = this;
	var dnsMasq = new DnsMasq();
	dnsMasq.on('error', function (err) {
		console.log("Error when starting DnsMasq:", err);
		self.handleExit(1);
	});
	dnsMasq.start();
	callback(null);
};

Main.prototype.startServices = function startServices (toExec) {
	console.log("Starting Services (", toExec, ")...");
	this.services = new ProcessUnion(toExec, this.loggerFactory);
	this.services.execute();
	this.__setListeners(this.services);
};

Main.prototype.__setListeners = function __setListeners (union) {
	var self = this;
	union.on('exit', function (exitedProcess) {
		if (exitedProcess.code) {
			self.logger.write("[CRASH] Process " + exitedProcess.appName + " with code " + exitedProcess.code + "\n");
		}
		console.log("Exiting eyeos-run-server because child process " + exitedProcess.appName + " died with code " + exitedProcess.code);
		self.handleExit(1);
	});

	process.on('SIGTERM', function () {
		console.log('received SIGTERM');
		if (self.services) {
			self.services.stop();
		}
	});
};

Main.prototype.handleExit = function handleExit (exitCode) {
	if (!this.handlingExit) {
		this.handlingExit = true;
		this.stop(exitCode);
	}
};


module.exports = Main;
