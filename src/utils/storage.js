export default class Storage {

    constructor(params, config){
        this.config = config;
        this.params = params;
        this.validity = (this.params.validitySeconds ? (this.params.validitySeconds * 1000) : null) || Infinity;
    };

    set = (key, value) => {
        if (/^[A-Za-z0-9\-_]+$/i.test(key)) {
            const envelop = {
                date: new Date().getTime(),
                value
            };

            return this._set(key, envelop);
        } else {

            return Promise.reject("Not a valid key. Use only chars and dashes.");
        }
    };

    get = (key) => {
        return this._get(key)
            .then((data) => {
                if (!!data) {
                    const { date, value } = data;
                    const now = new Date().getTime();
                    if (date + this.validity >= now) {
                        return value;
                    }
                }
                return {};
            });
    };

    _set = (key, value) => {
        throw new Error("The set method must be implemented");
    };

    _get = (key) => {
        throw new Error("The get method must be implemented");
    };

}
