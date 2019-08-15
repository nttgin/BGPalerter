import { Address4, Address6 } from "ip-address";

const ip = {

    isValid: function(ip) {
        if (ip.indexOf("/") !== -1){
            ip = ip.split("/")[0];
        }

        if (ip.indexOf(":") === -1){
            return new Address4(ip).isValid();
        } else {
            return new Address6(ip).isValid();
        }
    },

    sortByPrefixLength: function (a, b) {
        const netA = a.split("/")[1];
        const netB = b.split("/")[1];

        return parseInt(netA) - parseInt(netB);
    },

    toDecimal: function(ip) {
        let bytes = "";
        if (ip.indexOf(":") == -1) {
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

        if (ip.indexOf(":") == -1){
            binaryRoot = this.toDecimal(ip).padEnd(32, '0').slice(0, bits);
        } else {
            binaryRoot = this.toDecimal(ip).padEnd(128, '0').slice(0, bits);
        }

        return binaryRoot;

    },

    isSubnet: function (prefixContainer, prefixContained) {
        prefixContained = this.getNetmask(prefixContained);
        prefixContainer = this.getNetmask(prefixContainer);

        return prefixContained != prefixContainer && prefixContained.includes(prefixContainer);
    }

};

module.exports = ip;