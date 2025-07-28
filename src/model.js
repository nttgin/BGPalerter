export class Path {
    constructor(listAS) {
        this.value = listAS;
    };

    getFirst() {
        return this.value[0] ?? null;
    };

    getLast() {
        return this.value[this.value.length - 1] ?? null;
    };

    length() {
        return this.value.length;
    };

    toString() {
        return JSON.stringify(this.toJSON());
    };

    getValues() {
        return this.value.map(i => i.getValue());
    };

    toJSON() {
        return this.getValues();
    };

    _hasLoop(arr) {
        const seen = new Set();
        for (let i = 0; i < arr.length; i++) {
            if (seen.has(arr[i]) && arr[i] !== arr[i - 1]) {
                return true;
            }
            seen.add(arr[i]);
        }

        return false;
    }

    getSimplePath() {
        return this.value.map(i => i.numbers?.[0]).flat();
    }

    getNeighbors(of) {
        const simplePath = this.getSimplePath();

        if (this._hasLoop(simplePath)) { // Skip BGP loops
            return [null, null];
        }

        const path = [...new Set(simplePath)].slice(1); // Remove duplicates and peer

        const asn = of.numbers[0];
        const i = path.indexOf(asn);

        if (i >= 0) {

            const left = path?.[i - 1];
            const right = path?.[i + 1];

            return [left ? new AS(left) : null, right ? new AS(right) : null];
        } else {
            return [null, null];
        }
    };

    includes(asn) {
        return this.value.some(i => i.includes(asn));
    };
}

export class AS {
    static _instances = {};

    constructor(numbers) {
        this.numbers = null;
        this.ASset = false;
        this._valid = null;

        if (["string", "number"].includes(typeof (numbers))) {
            this.numbers = [numbers];
        } else if (numbers instanceof Array && numbers.length) {
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
        } else {
            throw new Error("Not valid AS number");
        }
    }

    getId() {
        return (this.numbers.length === 1) ? this.numbers[0] : this.numbers.sort().join("-");
    };

    isValid() {
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

    includes(ASn) {
        return ASn.numbers.every(i => this.numbers.includes(i));
    };

    isASset() {
        return this.ASset;
    };

    getValue() {
        return (this.numbers.length > 1) ? this.numbers : this.numbers[0];
    };

    toString() {
        const list = this.numbers.map(i => "AS" + i);

        return (list.length === 1 ? list : list.slice(0, list.length - 1).map(i => [i, ", "]).concat(["and ", list[list.length - 1]]).flat()).join("");
    };

    toJSON() {
        return this.numbers;
    };
}
