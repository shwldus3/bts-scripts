const axios = require('axios');
const https = require('https');

class HttpClient {

    #headers

    constructor(authorization) {
        this.#headers = { Authorization: `${authorization.token_type} ${authorization.access_token}` };
    }

    async post(url, body) {
        if (!this.#headers) {
            throw new Error('Invalid headers');
        }

        try {
            const options = {
                url,
                method: 'post',
                headers: this.#headers,
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            };
            if (body) {
                options.body = body;
            }
            const response = await axios(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async get(url, params) {
        if (!this.#headers) {
            throw new Error('Invalid headers');
        }

        try {
            const options = {
                url,
                method: 'get',
                headers: this.#headers,
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            };
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