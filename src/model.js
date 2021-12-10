export class Path {
    constructor(listAS) {
        this.value = listAS;
    };

    getLast (){
        return this.value[this.value.length - 1];
    };

    length () {
        return this.value.length;
    };

    toString () {
        return JSON.stringify(this.toJSON());
    };

    getValues () {
        return this.value.map(i => i.getValue());
    };

    toJSON () {
        return this.getValues();
    };

    getNeighbors (asn) {
        const path = this.value;
        const length = path.length - 1
        for (let n=0; n < length; n++) {
            const current = path[n] || null;
            if (current.getId() === asn.getId()) {
                const left = path[n - 1] || null;
                const right = path[n + 1] || null;

                return [left, current, right];
            }
        }

        return [null, null, null];
    };

    includes (asn) {
        return this.value.some(i => i.includes(asn));
    };
}


export class AS {
    static _instances = {};

    constructor(numbers) {
        this.numbers = null;
        this.ASset = false;
        this._valid = null;

        if (["string", "number"].includes(typeof(numbers))) {
            this.numbers = [ numbers ];
        } else if (numbers instanceof Array && numbers.length){
            if (numbers.length > 1) {
                this.ASset = true;
            }
            this.numbers = numbers;
        }

        if (this.isValid()) {
            this.numbers = this.numbers.map(i => parseInt(i));

            const key = this.numbers.join("-");
            if (!!AS._instances[key]) {
                return AS._instances[key];
            }

            AS._instances[key] = this;
        }
    }

    getId () {
        return (this.numbers.length === 1) ? this.numbers[0] : this.numbers.sort().join("-");
    };

    isValid () {
        if (this._valid === null) {
            this._valid = this.numbers &&
                this.numbers.length > 0 &&
                this.numbers
                    .every(asn => {

                        try {
                            const intAsn = parseInt(asn);
                            if (intAsn != asn) {
                                return false;
                            }
                            asn = intAsn;
                        } catch (e) {
                            return false;
                        }

                        return asn >= 0 && asn <= 4294967295;
                    }) &&
                [...new Set(this.numbers.map(i => parseInt(i)))].length === this.numbers.length;
        }

        return this._valid;
    };

    includes (ASn){

        for (let a of ASn.numbers) {
            if (!this.numbers.includes(a)) {
                return false;
            }
        }

        return true;
    };

    isASset () {
        return this.ASset;
    };

    getValue () {
        return (this.numbers.length > 1) ? this.numbers : this.numbers[0];
    };

    toString() {
        return this.numbers.map(i => "AS" + i).join(", and ");
    };

    toJSON () {
        return this.numbers;
    };
}
