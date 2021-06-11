import axios from "axios";

export default class Config {
    static configVersion = 2;
    constructor(params) {
        this.default = {
            configVersion: Config.configVersion,
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
                },
                // {
                //     file: "connectorRISDump",
                //     name: "dmp"
                // }
            ],
            monitors: [
                {
                    file: "monitorHijack",
                    channel: "hijack",
                    name: "basic-hijack-detection",
                    params: {
                        thresholdMinPeers: 3
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
                    name: "asn-monitor",
                    params: {
                        thresholdMinPeers: 3
                    }
                },
                {
                    file: "monitorRPKI",
                    channel: "rpki",
                    name: "rpki-monitor",
                    params: {
                        thresholdMinPeers: 3,
                        checkUncovered: false,
                        checkDisappearing: false
                    }
                },
                {
                    file: "monitorROAS",
                    channel: "rpki",
                    name: "rpki-diff",
                    params: {
                        enableDiffAlerts: true,
                        enableExpirationAlerts: true,
                        enableExpirationCheckTA: true,
                        enableDeletedCheckTA: true,
                        roaExpirationAlertHours: 2,
                        checkOnlyASns: true,
                        toleranceDeletedRoasTA: 20,
                        toleranceExpiredRoasTA: 20
                    }
                },
                {
                    file: "monitorPathNeighbors",
                    channel: "hijack",
                    name: "path-neighbors",
                    params: {
                        thresholdMinPeers: 3
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
            rest: {
                host: "localhost",
                port: 8011
            },
            checkForUpdatesAtBoot: true,
            pidFile: "bgpalerter.pid",
            fadeOffSeconds: 360,
            checkFadeOffGroupsSeconds: 30
        };
    };

    downloadDefault = () => {
        return axios({
            url: 'https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example',
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