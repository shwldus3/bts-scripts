const axios = require('axios');
const btoa = require('btoa');
const url = require('url');

const { HttpClient } = require('./HttpClient.js');
const httpClient = new HttpClient();

// const getAccessToken = async () => {
//     try {
//         const encodedClientInfo = btoa('97fab324741d438dbac805e98846fdc5:65bbaa85a90349b7b82f6d2672719bca');
//         const options = {
//             url: 'https://accounts.spotify.com/api/token?grant_type=client_credentials',
//             method: 'post',
//             params: new url.URLSearchParams({ grant_type: 'client_credentials' }),
//             headers: { Authorization: `Basic ${encodedClientInfo}`, 'Content-Type': 'application/x-www-form-urlencoded' }
//         };
//         const response = await axios(options);
//         return response.data;
//       } catch (error) {
//         console.error(error);
//     }
// }

const getBtsAlbums = async () => {
    const url = 'https://api.spotify.com/v1/search';
    console.log(request.post(url));
}

const runScript = async () => {
    const getBtsAlbums = await getBtsAlbums();
    console.log(accessToken);
}

runScript();