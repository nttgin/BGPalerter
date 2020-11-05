
export default function diff (vrpsOld, vrpsNew, asn) {

    const getKey = (vrp) => {
        return `${vrp.ta}-${vrp.prefix}-${vrp.asn}-${vrp.maxLength}`;
    };

    const getDiff = (vrpsOld, vrpsNew, asn)  => {
        const prefixes = [...new Set(vrpsOld.concat(vrpsNew).filter(i => i.asn === asn).map(i => i.prefix))];

        const filteredVrpsOld = vrpsOld.filter(i => i.asn === asn || prefixes.includes(i.prefix))
            .map(i => {
                i.status = "removed";
                return i;
            });
        const filteredVrpsNew = vrpsNew.filter(i => i.asn === asn || prefixes.includes(i.prefix))
            .map(i => {
                i.status = "added";
                return i;
            });

        const index = {};

        for (let vrp of filteredVrpsOld.concat(filteredVrpsNew)) {
            const key = getKey(vrp);
            index[key] = index[key] || [];
            index[key].push(vrp);
        }

        return Object.values(index).filter(i => i.length === 1).map(i => i[0]);
    };

    return getDiff(vrpsOld, vrpsNew, asn);
}
