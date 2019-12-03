export class Path {
    constructor(listAS) {
        this.value = listAS;
    };

    getLast = () => {
        return this.value[this.value.length - 1];
    };

    toString = () => {
        return JSON.stringify(this.toJSON());
    };

    getValues = () => {
        return this.value.map(i => i.getValue());
    };

    toJSON = () => this.getValues();
}


export class AS {
    constructor(numbers) {
        this.numbers = null;
        this.ASset = false;

        if (["string", "number"].includes(typeof(numbers))) {
            this.numbers = [ numbers ];
        } else if (numbers instanceof Array && numbers.length){
            this.ASset = true;
            if (numbers.length === 1) {
                this.numbers = [ numbers[0] ];
            } else {
                this.numbers = numbers;
            }
        }

        if (this.isValid()) {
            this.numbers = this.numbers.map(i => parseInt(i));
        }
    }

    getId = () => {
        return (this.numbers.length === 1) ? this.numbers[0] : this.numbers.sort().join("-");
    };

    isValid = () => {
        return this.numbers.length > 0 &&
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

                    return asn > 0 && asn <= 4294967295;
                }) &&
            [...new Set(this.numbers.map(i => parseInt(i)))].length === this.numbers.length;
    };

    includes = (ASn) => {

        for (let a of ASn.numbers) {
            if (!this.numbers.includes(a)) {
                return false;
            }
        }

        return true;
    };

    isASset = () => {
        return this.ASset;
    };

    getValue = () => {
        return (this.numbers.length > 1) ? this.numbers : this.numbers[0]
    };

    toString = () => {
        return this.numbers.map(i => "AS" + i).join(", and ");
    };

    toJSON = () => {
        return this.numbers;
    }
}