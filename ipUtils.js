import { Address4, Address6 } from "ip-address";

const ip = {

    isValidPrefix: function(prefix){
        let bits, ip;

        try {
            if (prefix.indexOf("/") !== -1) {
                const components = prefix.split("/");
                ip = components[0];
                bits = parseInt(components[1]);
            } else {
                return false;
            }

            if (ip.indexOf(":") === -1) {
                return this.isValidIP(ip) && (bits >= 0 && bits <= 32);
            } else {
                return this.isValidIP(ip) && (bits >= 0 && bits <= 128);
            }

        } catch (e) {
            return false;
        }
    },

    isValidIP: function(ip) {

        try {
            if (ip.indexOf(":") === -1) {
                return new Address4(ip).isValid();
            } else {
                return new Address6(ip).isValid();
            }
        } catch (e) {
            return false;
        }
    },

    sortByPrefixLength: function (a, b) {
        const netA = a.split("/")[1];
        const netB = b.split("/")[1];

        return parseInt(netA) - parseInt(netB);
    },

    toDecimal: function(ip) {
        let bytes = "";
        if (ip.indexOf(":") === -1) {
            bytes = ip.split(".").map(ip => parseInt(ip).toString(2).padStart(8, '0')).join("");
        } else {
            bytes = ip.split(":").filter(ip => ip !== "").map(ip => parseInt(ip, 16).toString(2).padStart(16, '0')).join("");
        }

        return bytes;
    },

    getNetmask: function(prefix) {
        const components = prefix.split("/");
        const ip = components[0];
        const bits = components[1];

        let binaryRoot;

        if (ip.indexOf(":") === -1){
            binaryRoot = this.toDecimal(ip).padEnd(32, '0').slice(0, bits);
        } else {
            binaryRoot = this.toDecimal(ip).padEnd(128, '0').slice(0, bits);
        }

        return binaryRoot;

    },

    isSubnetBinary: (prefixContainer, prefixContained) => {
        return prefixContained != prefixContainer && prefixContained.includes(prefixContainer);
    },

    isSubnet: function (prefixContainer, prefixContained) {
        return this.isSubnetBinary(this.getNetmask(prefixContainer), this.getNetmask(prefixContained));
    }

};

module.exports = ip;