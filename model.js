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

    toJSON = () => this.value.map(i => i.getValue());
}


export class AS {
    constructor(numbers) {
        this.numbers = null;
        this.ASset = false;

        if (["string", "number"].includes(typeof(numbers))) {
            this.numbers = [ parseInt(numbers) ];
        } else if (numbers instanceof Array && numbers.length){
            this.ASset = true;
            if (numbers.length === 1) {
                this.numbers = [ parseInt(numbers[0]) ];
            } else {
                this.numbers = numbers.map(i => parseInt(i));
            }
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
                        asn = parseInt(asn);
                    } catch (e) {
                        return false;
                    }

                    return asn > 0 && asn <= 4294967295;
                })
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