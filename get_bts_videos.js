'use strict';

const {google} = require('googleapis');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');

/*
    https://developers.google.com/identity/protocols/oauth2
    https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/youtube/search.js
    https://developers.google.com/youtube/v3/libraries?hl=ko
*/

// initialize the Youtube API library
const youtube = google.youtube('v3');

// a very simple example of searching for youtube videos
async function runSample() {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, './oauth2.keys.json'),
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });
  google.options({auth});

  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud',
  });
  console.log(res.data);
}

if (module === require.main) {
  runSample().catch(console.error);
}