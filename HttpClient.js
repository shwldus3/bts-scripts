class HttpClient {

    #headers

    constructor(authorization) {
        this.#headers = { Authorization: `${authorization.type} ${authorization.accessToken}` };
    }

    async post(url, params, data) {
        if (!this.#headers) {
            throw new Error('Invalid headers');
        }

        try {
            const options = {
                url,
                headers: this.#headers
            };
            if (params) {
                options.params = params;
            }
            if (data) {
                options.data = data;
    
            }
            const response = await axios(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports.HttpClient = HttpClient;