import Storage from "../storage";
import fs from "fs";

export default class StorageFile extends Storage{
    constructor(params, config){
        super(params, config);
        this.directory = this.config.volume + (this.params.directory || ".cache/");
        this.enabled = true;
        try {
            if (!fs.existsSync(this.directory)) {
                fs.mkdirSync(this.directory);
            }
        } catch(error) {
            this.enabled = false;
        }
    };

    _set = (key, value) =>
        new Promise((resolve, reject) => {
            if (this.enabled) {
                const file = this.directory + key + ".json";
                try {
                    fs.writeFileSync(file, JSON.stringify(value));
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject("The .cache/ directory is not writeable");
            }
        });

    _get = (key) =>
        new Promise((resolve, reject) => {
            if (this.enabled) {
                const file = this.directory + key + ".json";
                try {
                    if (fs.existsSync(file)) {
                        resolve(JSON.parse(fs.readFileSync(file, 'utf8')));
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                reject("The .cache/ directory is not writeable");
            }
        });
}
