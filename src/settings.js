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

if(process.env.SERF_ARGS){
	var serf_args_env = process.env.SERF_ARGS.split(',');
}

var settings = {
	serf: {
		binary: 'serf',
		start: serf_args_env || ["agent", "--log-level=DEBUG", "-join", "172.17.42.1", "-event-handler=tagsToDns"],
		stop: "leave"
	},
	logging: {
		syslog: {
			host: 'logstash.service.consul',
			port: 5000,
			type: 'tcp',
			maxConnectionRetry: process.env.LOG_CONNECTION_MAX_RETRY || 250
		},
		stdout: {
			// We're forcing this to true, as the syslog logger is currently
			// disabled.
			enabled: true //process.env.EYEOS_STDOUT_LOGGER_ENABLED === "true"
		},
		logsRuntimeSettingsFile: process.env.EYEOS_LOGS_RUNTIME_SETTINGS_FILE ||'/tmp/eyeos_settings/logs.json'
	},
	dnsmasq: {
		hostsPath: '/hosts/',
		hostsFile: 'hosts.serf',
		resolvFile: process.env.EYEOS_RUN_SERVER_RESOLV || '/resolv.conf'
	},
	gatewayResolver: {
		hostsFile: '/etc/hosts'
	},
	microServiceChecker: {
		timeout: process.env.MICROSERVICE_TIMEOUT || 60000,
		retryTime: process.env.MICROSERVICE_RETRYTIME || 1000
	},
	serviceDiscovery: process.env.EYEOS_SERVICE_DISCOVERY || 'serf'
};

module.exports = settings;
