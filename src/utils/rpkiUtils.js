import rpki from "rpki-validator";
import fs from "fs";

export default class RpkiUtils {
    constructor(env) {
        this.config = env.config;
        this.agent = env.agent;
        this.params = this.config.rpki || {};
        this.clientId = env.clientId || "";
        this.logger = env.logger;

        const providers = [ "ripe", "cloudflare", "external"]; // First provider is the default one

        if (this.params.vrpFile) {
            this.params.vrpProvider = "external";
            this.params.refreshVrpListMinutes = null;
            this.params.preCacheROAs = true;
        } else {
            if (!this.params.vrpProvider) {
                this.params.vrpProvider = providers[0];
            } else if (!providers.includes(this.params.vrpProvider)) {
                this.params.vrpProvider = providers[0];
                this.logger.log({
                    level: 'error',
                    message: "The specified vrpProvider is not valid. Using default vrpProvider."
                });
            }
            this.params.refreshVrpListMinutes = Math.max(this.params.refreshVrpListMinutes || 0, 15);
            this.params.preCacheROAs = this.params.preCacheROAs !== false;
        }

        this._loadRpkiValidator();
    };

    _loadRpkiValidatorFromVrpProvider = () => {

        if (!this.rpki) {
            const rpkiValidatorOptions = {
                connector: this.params.vrpProvider,
                clientId: this.clientId
            };

            if (!this.params.noProxy && this.agent) {
                rpkiValidatorOptions.httpsAgent = this.agent;
            }

            this.rpki = new rpki(rpkiValidatorOptions);

            if (!!this.params.preCacheROAs) {
                this._preCache()
                    .catch(() => {
                        this.logger.log({
                            level: 'error',
                            message: "One of the VRPs lists cannot be downloaded. The RPKI monitoring should be working anyway with one of the on-line providers."
                        });
                    });
            }
        }
    };

    _watchVrpFile = (vrpFile) => {
        const reload = () => { // Watch the external file to refresh the list
            if (this.watchFileTimer) {
                clearTimeout(this.watchFileTimer);
            }
            this.watchFileTimer = setTimeout(() => {
                this.logger.log({
                    level: 'info',
                    message: "VRPs reloaded due to file change."
                });
                this._loadRpkiValidatorFromVrpFile(vrpFile);
            }, 3000);
        };

        fs.watchFile(vrpFile, reload);
    };

    _loadRpkiValidatorFromVrpFile = (vrpFile) => {
        console.log("LOADING");

        if (fs.existsSync(vrpFile)) {
            try {
                let vrps = JSON.parse(fs.readFileSync(vrpFile, 'utf8'));

                if (vrps) {
                    if (vrps.roas && vrps.roas.length) {
                        vrps = vrps.roas;
                    }
                    if (vrps.length > 0) {

                        if (this.rpki) {
                            this.rpki.destroy();
                        }

                        this.rpki = new rpki({
                            connector: "external",
                            clientId: this.clientId
                        });

                        this.rpki.setVRPs(vrps);

                        this._preCache()
                            .catch(() => {
                                this.logger.log({
                                    level: 'error',
                                    message: "It was not possible to load correctly the VRPs file. Possibly there is an error in the format. The RPKI monitoring should be working anyway with one of the on-line providers."
                                });
                            });

                    } else {
                        this.logger.log({
                            level: 'error',
                            message: "The provided VRPs file is empty. Using default vrpProvider."
                        });
                    }
                }

            } catch (error) {
                this.logger.log({
                    level: 'error',
                    message: "The provided VRPs file cannot be parsed. Using default vrpProvider."
                });
            }
        } else {
            this.logger.log({
                level: 'error',
                message: "The provided VRPs file cannot be found. Using default vrpProvider."
            });
        }

        return this._loadRpkiValidatorFromVrpProvider();
    };

    _loadRpkiValidator = () => {
        if (!!this.params.vrpFile) {
            const vrpFile = this.config.volume + this.params.vrpFile;
            this._loadRpkiValidatorFromVrpFile(vrpFile);
            this._watchVrpFile(vrpFile);
        } else {
            this._loadRpkiValidatorFromVrpProvider();
        }
    };

    _preCache = () => {
        if (!!this.params.preCacheROAs) {
            return this.rpki
                .preCache(this.params.refreshVrpListMinutes)
                .catch(() => {
                    console.log("ERROR");
                    this.logger.log({
                        level: 'error',
                        message: "One of the VRPs lists cannot be downloaded. The RPKI monitoring should be working anyway with one of the on-line providers."
                    });
                });
        } else {
            return Promise.resolve();
        }
    }

    validate = (prefix, origin) => {
        return this._preCache()
            .then(() => {
                return this.rpki.validate(prefix, origin, true);
            });
    };
}