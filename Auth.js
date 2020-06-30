const axios = require('axios');
const btoa = require('btoa');
const https = require('https');
const url = require('url');

class Auth {

    #authorization

    #clientId;

    #clientSecret

    constructor(clientId = '97fab324741d438dbac805e98846fdc5', clientSecret = '65bbaa85a90349b7b82f6d2672719bca') {
        this.#clientId = clientId;
        this.#clientSecret = clientSecret;
    }

    set authorization(authorization) {
        this.#authorization = authorization;
    }

    get authorization() {
        return this.#authorization
    }

    static async generate(clientId, clientSecret) {
        try {
            const auth = new Auth(clientId, clientSecret);

            const encodedClientInfo = btoa(`${auth.#clientId}:${auth.#clientSecret}`);
            const options = {
                url: 'https://accounts.spotify.com/api/token',
                method: 'post',
                params: new url.URLSearchParams({ grant_type: 'client_credentials' }),
                headers: { Authorization: `Basic ${encodedClientInfo}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            };
            const response = await axios(options);
            auth.authorization = response.data;
            console.log('Certification has been created');

            return auth;
          } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Auth;