
function getPrefixes(vrp, asn) {
    return [...new Set(vrp.filter(i => i.asn === asn).map(i => i.prefix))];
}

function getRelevant(vrp, prefixes, asns=[]){
    return vrp.filter(i => asns.includes(i.asn) || prefixes.includes(i.prefix));
}

function diff(vrpsOld, vrpsNew, asn, prefixesIn=[]) {
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



function diffBetweenOldAndNew(vrpsOld, vrpsNew)
{
    const diff = {};
    const keyIterator = vrp => vrp._key = `${vrp.ta}-${vrp.prefix}-${vrp.asn}-${vrp.maxLength}`;
    const sorter = (a,b) => {
        if (a._key < b._key) {
            return -1;
        }
        if (a._key > b._key) {
            return 1;
        }
        return 0;
    }; 
    vrpsOld.forEach(keyIterator);
    vrpsNew.forEach(keyIterator);
    vrpsOld.sort(sorter);
    vrpsNew.sort(sorter);
    let diffs = [...compare(vrpsNew, vrpsOld, 'added'), ...compare(vrpsOld, vrpsNew, 'removed')];
    for(const vrp of diffs) {
        if (diff[vrp.asn]) {
            diff[vrp.asn].push(vrp)
        } else {
            diff[vrp.asn] =[vrp]
        }
    }
    return diff;
}

// Contains in arr1 and not contains in array 2
function compare(arr1, arr2, status) {
    let i = 0;
    let j = 0;
    let compare = [];

    if (!arr1.length) {
        return [];
    }
    if (!arr2.length) {
        return arr1;
    }
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i]._key < arr2[j]._key) {
            compare.push({status, ...arr1[i++]});
        } else if (arr1[i]._key === arr2[j]._key) {
            i++;
            j++;
        } else {
            j++;
        }
    }
    for (; i < arr1.length; i++) {
        compare.push({status, ...arr1[i]});
    }
    return compare;
}

export {
    getPrefixes,
    getRelevant,
    diff,
    diffBetweenOldAndNew
};