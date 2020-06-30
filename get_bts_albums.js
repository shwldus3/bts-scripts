'use strict'

const axios = require('axios');
const btoa = require('btoa');
const https = require('https');
const url = require('url');

const HttpClient = require('./HttpClient');
const Auth = require('./Auth');

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