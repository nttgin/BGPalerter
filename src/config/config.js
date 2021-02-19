import axios from "axios";

export default class Config {
    constructor(params) {
        this.default = {
            environment: "production",
            connectors: [
                {
                    file: "connectorRIS",
                    name: "ris",
                    params: {
                        carefulSubscription: true,
                        url: "ws://ris-live.ripe.net/v1/ws/",
                        perMessageDeflate: true,
                        subscription: {
                            moreSpecific: true,
                            type: "UPDATE",
                            host: null,
                            socketOptions: {
                                includeRaw: false
                            }
                        }
                    }
                }
            ],
            monitors: [
                {
                    file: "monitorHijack",
                    channel: "hijack",
                    name: "basic-hijack-detection",
                    params: {
                        thresholdMinPeers: 2
                    }
                },
                {
                    file: "monitorPath",
                    channel: "path",
                    name: "path-matching",
                    params: {
                        thresholdMinPeers: 1
                    }
                },
                {
                    file: "monitorNewPrefix",
                    channel: "newprefix",
                    name: "prefix-detection",
                    params: {
                        thresholdMinPeers: 3
                    }
                },
                {
                    file: "monitorVisibility",
                    channel: "visibility",
                    name: "withdrawal-detection",
                    params: {
                        thresholdMinPeers: 40
                    }
                },
                {
                    file: "monitorAS",
                    channel: "misconfiguration",
                    name: "as-monitor",
                    params: {
                        thresholdMinPeers: 3
                    }
                },
                {
                    file: "monitorRPKI",
                    channel: "rpki",
                    name: "rpki-monitor",
                    params: {
                        thresholdMinPeers: 1,
                        checkUncovered: false
                    }
                }
            ],
            reports: [
                {
                    file: "reportFile",
                    channels: ["hijack", "newprefix", "visibility", "path", "misconfiguration", "rpki"]
                }
            ],
            notificationIntervalSeconds: 86400,
            alarmOnlyOnce: false,
            monitoredPrefixesFiles: ["prefixes.yml"],
            persistStatus: true,
            generatePrefixListEveryDays: 0,
            logging: {
                directory: "logs",
                logRotatePattern: "YYYY-MM-DD",
                maxRetainedFiles: 10,
                maxFileSizeMB: 15,
                compressOnRotation: false,
            },
            rpki: {
                vrpProvider: "ntt",
                preCacheROAs: true,
                refreshVrpListMinutes: 15
            },
            checkForUpdatesAtBoot: true,
            pidFile: "bgpalerter.pid",
            fadeOffSeconds: 360,
            checkFadeOffGroupsSeconds: 30
        };
    };

    downloadDefault = () => {
        return axios({
            url: 'https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example',
            method: 'GET',
            responseType: 'blob', // important
        })
            .then(response => response.data);
    };

    retrieve = () => {
        throw new Error('The method retrieve must be implemented in the config connector');
    };

    save = () => {
        throw new Error('The method save must be implemented in the config connector');
    };

}