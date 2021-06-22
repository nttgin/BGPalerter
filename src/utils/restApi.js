import restify from "restify";

export default class RestApi {
    static _instance;

    constructor(params) {

        this.params = params;
        this.port = this.params.port || 8011;
        this.host = this.params.host || null;
        this.enabled = false;
        this.urls = {};
        this._serverPromise = null;

        if (!!RestApi._instance) {
            return RestApi._instance;
        }

        RestApi._instance = this;
    }

    _startServer = () => {
        if (!this._serverPromise) {
            this._serverPromise = new Promise((resolve, reject) => {
                try {
                    if (this.host && this.port) {
                        this.server = restify.createServer();
                        this.server.pre(restify.pre.sanitizePath());
                        this.server.listen(this.port, this.host);
                        this.enabled = true;
                        resolve();
                    } else if (this.port) {
                        this.server = restify.createServer();
                        this.server.pre(restify.pre.sanitizePath());
                        this.server.listen(this.port);
                        this.enabled = true;
                        resolve();
                    } else {
                        this.enabled = false
                        reject("The port parameter must be specified to start the REST API.")
                    }
                } catch (error) {
                    this.enabled = false;
                    reject(error);
                }
            });
        }

        return this._serverPromise;
    };

    addUrl = (url, callback) => {
        if (this.urls[url]) {
            return Promise.reject("The URL for the REST API already exists and cannot be replaced");
        } else {
            this.urls[url] = callback;
            return this._startServer()
                .then(() => {
                    this.server.get(url, this.urls[url]);
                })
        }
    }
}