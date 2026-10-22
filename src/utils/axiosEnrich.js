import md5 from "md5";

const attempts = {};
const numAttempts = 2;

const retry = function (sendRequest, error, params, key) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            attempts[key] = attempts[key] || 0;
            attempts[key]++;
            if (attempts[key] <= numAttempts) {
                resolve(sendRequest(params));
            } else {
                delete attempts[key];
                reject(error);
            }
        }, 2000);
    });
};

export default function (axios, userAgent) {
    const sendRequest = params => typeof axios.request === "function" ? axios.request(params) : axios(params);

    return params => {
        const requestParams = params || {};
        const headers = {
            ...(requestParams.headers || {})
        };

        if (userAgent && headers["user-agent"] == null && headers["User-Agent"] == null) {
            headers["user-agent"] = userAgent;
        }

        if (headers["accept-encoding"] == null && headers["Accept-Encoding"] == null) {
            headers["accept-encoding"] = "gzip";
        }

        // redaxios can serialize headers.common as a literal "common" header.
        delete headers.common;

        const enrichedParams = {
            ...requestParams,
            headers
        };
        const key = md5(JSON.stringify(enrichedParams));

        return sendRequest(enrichedParams)
            .catch(error => retry(sendRequest, error, enrichedParams, key))
            .then(response => {
                delete attempts[key];
                return response;
            });
    };
}