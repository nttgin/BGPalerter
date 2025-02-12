function getPrefixes(vrp, asn) {
    return [...new Set(vrp.filter(i => i.asn === asn).map(i => i.prefix))];
}

function getRelevant(vrp, prefixes, asns = []) {
    return vrp.filter(i => asns.includes(i.asn) || prefixes.includes(i.prefix));
}

function diff(vrpsOld, vrpsNew, asn, prefixesIn = []) {
    asn = parseInt(asn);

    let prefixes;
    if (asn) {
        prefixes = [...new Set(prefixesIn)];
    } else {
        prefixes = [...new Set([...prefixesIn, ...getPrefixes(vrpsOld, asn), ...getPrefixes(vrpsNew, asn)])];
    }
    const filteredVrpsOld = JSON.parse(JSON.stringify(getRelevant(vrpsOld, prefixes, [asn])))
        .map(i => {
            i.status = "removed";
            return i;
        });
    const filteredVrpsNew = JSON.parse(JSON.stringify(getRelevant(vrpsNew, prefixes, [asn])))
        .map(i => {
            i.status = "added";
            return i;
        });

    const index = {};

    for (let vrp of filteredVrpsOld.concat(filteredVrpsNew)) {
        const key = `${vrp.ta}-${vrp.prefix}-${vrp.asn}-${vrp.maxLength}`;
        index[key] = index[key] || [];
        index[key].push(vrp);
    }

    return Object.values(index).filter(i => i.length === 1).map(i => i[0]);
}

export {
    getPrefixes,
    getRelevant,
    diff
};