const { Authorization } = require("./Authorization");

class HttpClient {

    #accessToken

    constructor() {
        this.#accessToken = new Authorization().accessToken();
    }

    async post(url, params, data) {
        if (!this.#accessToken) {
            throw new Error('Invalid access token');
        }

        try {
            const options = {
                url,
                headers: { Authorization: `Bearer ${this.#accessToken}` }
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

this.HttpClient = HttpClient;