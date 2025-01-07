export class Path {
    constructor(listAS) {
        this.value = listAS;
    };

    getLast() {
        return this.value[this.value.length - 1];
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

    getUniqueValues() {
        if (!this.uniqueValues) {
            const index = {};
            const out = [];

            for (let asn of this.value) {
                const key = asn.getId();

                if (!index[key]) {
                    out.push(asn);
                    index[key] = asn;
                }
            }

            this.uniqueValues = out;
        }

        return this.uniqueValues ?? [];
    }

    getNeighbors(of) {
        const path = [null, ...this.getUniqueValues(), null];
        const simplePath = path.map(i => i?.numbers?.[0] ?? null);
        const asn = of.numbers[0];
        const i = simplePath.indexOf(asn);

        if (i >= 0) {
            const [left = null, current = null, right = null] = path.slice(i - 1, i + 2);

            return [left ?? null, current, right ?? null];
        }

        return [null, null, null];
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
