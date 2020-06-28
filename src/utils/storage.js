export default class Storage {

    constructor(params, config){
        this.config = config;
        this.params = params;
        this.validity = (this.params.validitySeconds || 3600 * 2) * 1000;
    };

    set = (key, value) =>
        new Promise((resolve, reject) => {
            if (/^[a-z\-]+$/i.test(key)) {

                const envelop = {
                    date: new Date().getTime(),
                    value
                };
                this._set(key, envelop)
                    .then(resolve);
                resolve();
            } else {
                reject("Not a valid key. Use only chars and dashes.");
            }
        });

    get = (key) =>
        new Promise((resolve, reject) => {
            if (/^[a-z\-]+$/i.test(key)) {
                this._get(key)
                    .then((data) => {
                        if (!!data) {
                            const { date, value } = data;
                            const now = new Date().getTime();
                            if (date + this.validity >= now) {
                                return value;
                            }
                        }
                        return {};
                    })
                    .then(resolve);
            } else {
                reject("Not a valid key. Use only chars and dashes.");
            }
        });

    _set = (key, value) => {
        throw new Error("The set method must be implemented");
    };

    _get = (key) => {
        throw new Error("The get method must be implemented");
    };

}
