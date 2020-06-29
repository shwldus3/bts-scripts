class Auth {

    #authorization

    #clientId;

    #clientSecret

    constructor(clientId = '97fab324741d438dbac805e98846fdc5', clientSecret = '65bbaa85a90349b7b82f6d2672719bca') {
        this.#clientId = clientId;
        this.#clientSecret = clientSecret;
        this.#authorization = this.generateAuth();
    }

    get authorization() {
        return this.#authorization
    }

    async generateAuth() {
        try {
            const encodedClientInfo = btoa(`${this.#clientId}:${this.#clientSecret}`);
            const options = {
                url: 'https://accounts.spotify.com/api/token',
                method: 'post',
                params: new url.URLSearchParams({ grant_type: 'client_credentials' }),
                headers: { Authorization: `Basic ${encodedClientInfo}`, 'Content-Type': 'application/x-www-form-urlencoded' }
            };
            const response = await axios(options);
            return response.data;
          } catch (e) {
            console.error(e);
            throw new Error(e);
        }
    }
}

module.exports.Auth = Auth;