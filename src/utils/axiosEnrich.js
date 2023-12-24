import md5 from "md5";

const attempts = {};
const numAttempts = 2;

const retry = function (axios, error, params) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const key = md5(JSON.stringify(params));
            attempts[key] = attempts[key] || 0;
            attempts[key]++;
            if (attempts[key] <= numAttempts) {
                resolve(axios.request(params));
            } else {
                reject(error);
            }
        }, 2000);
    });
}

export default function(axios, httpsAgent, userAgent) {

    axios.defaults ??= {};
    axios.defaults.headers ??= {};
    axios.defaults.headers.common ??= {};

    // Set agent/proxy
    if (httpsAgent) {
        axios.defaults.httpsAgent = httpsAgent;
    }

    if (userAgent) {
        axios.defaults.headers.common = {
            "User-Agent": userAgent
        };
    }

    axios.defaults.headers.common = {
        ...axios.defaults.headers.common,
        'Accept-Encoding': 'gzip'
    };

    return params => axios(params)
        .catch(error => retry(axios, error, params));
}