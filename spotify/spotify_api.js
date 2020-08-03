'use strict'

const btoa = require('btoa');

const HttpClient = require('../http/HttpClient');
const Auth = require('./SpotifyAuth');

const getBtsArtistId = async () => {
    try {
        const auth = await Auth.generate();
        const httpClient = new HttpClient(auth.authorization);
        const url = 'https://api.spotify.com/v1/search';
        const params = {
            "q": "BTS",
            "type": "artist"
        };
        const data = await httpClient.get(url, params);
        console.log(data);
    } catch(e) {
        console.error(e);
    }
}

getBtsArtistId();