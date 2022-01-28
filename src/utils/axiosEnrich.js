import md5 from "md5";

const attempts = {};
const numAttempts = 2;

const retry = function (axios, error) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const key = md5(JSON.stringify(error.config));
            attempts[key] = attempts[key] || 0;
            attempts[key]++;
            if (attempts[key] <= numAttempts) {
                resolve(axios.request(error.config));
            } else {
                reject(error);
            }
        }, 2000);
    });
}

export default function(axios, httpsAgent, userAgent) {

    // Set agent/proxy
    if (httpsAgent) {
        axios.defaults.httpsAgent = httpsAgent;
    }

    if (userAgent) {
        axios.defaults.headers.common = {
            "User-Agent": userAgent
        };
    }

    // Retry
    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.config) {
                return retry(axios, error);
            }
            return Promise.reject(error);
        });

    return axios;
}