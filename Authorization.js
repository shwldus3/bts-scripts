class Authorization {

    #accessToken

    #clientId = '97fab324741d438dbac805e98846fdc5';

    #clientSecret = '65bbaa85a90349b7b82f6d2672719bca'

    constructor() {
        this.#accessToken = this.#getAccessToken();
    }

    async #getAccessToken() {
        try {
            const encodedClientInfo = btoa(`${this.#clientId}:${this.#clientSecret}`);
            const options = {
                url: 'https://accounts.spotify.com/api/token?grant_type=client_credentials',
                method: 'post',
                params: new url.URLSearchParams({ grant_type: 'client_credentials' }),
                headers: { Authorization: `Basic ${encodedClientInfo}`, 'Content-Type': 'application/x-www-form-urlencoded' }
            };
            const response = await axios(options);
            this.#accessToken = response.data.access_token;
          } catch (error) {
            console.error(error);
        }
    }

    get accessToken() {
        return this.#accessToken
      }

}

exports.Authorization = Authorization;