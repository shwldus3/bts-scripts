const axios = require('axios');
const https = require('https');

class HttpClient {

    #authorization

    constructor(authorization = null) {
        if (!!authorization) {
            this.#authorization = { Authorization: `${authorization.token_type} ${authorization.access_token}` };
        }
    }

    async post(url, body) {
        try {
            const options = {
                url,
                method: 'post'
            };
            if (!!this.#authorization) {
                options.headers = Object.assign({}, this.#authorization);
                options.httpsAgent = new https.Agent({ rejectUnauthorized: false })
            }
            if (body) {
                options.body = body;
            }
            const response = await axios(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async get(url, params = null) {
        try {
            const options = {
                url,
                method: 'get'
            };
            if (!!this.#authorization) {
                options.headers = Object.assign({}, this.#authorization);
                options.httpsAgent = new https.Agent({ rejectUnauthorized: false })
            }
            if (params) {
                options.params = params;
            }
            const response = await axios(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = HttpClient;