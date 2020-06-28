import Storage from "../storage";
import fs from "fs";

export default class StorageFile extends Storage{
    constructor(params, config){
        super(params, config);
        this.directory = this.config.volume + (this.params.directory || ".cache/");
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }
    };

    _set = (key, value) =>
        new Promise((resolve, reject) => {
            const file = this.directory + key + ".json";
            fs.writeFile(file, JSON.stringify(value), error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });

    _get = (key) =>
        new Promise((resolve, reject) => {
            const file = this.directory + key + ".json";
            if (fs.existsSync(file)) {
                fs.readFile(file, (error, content) => {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            resolve(JSON.parse(content));
                        } catch (e) {
                            resolve({});
                        }
                    }
                });
            } else {
                resolve({});
            }
        });
}
