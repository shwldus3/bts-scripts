'use strict';

const { google } = require('googleapis');
const path = require('path');
const 

// initialize the Youtube API library
const youtube = google.youtube('v3');

const API_KEY = '';

const searchList = async () => {
  const res = await youtube.search.list({
    key: API_KEY,
    part: 'id,snippet',
    q: 'ibighit',
  });
  return res.data;
};

const playlist = async (channelId) => {
  const res = await youtube.playlists.list({
    key: API_KEY,
    channelId,
    part: 'id,snippet',
    maxResults: 20
  });
  return res.data;
}

const statistics = async (id) => {
  const res = await youtube.channels.list({
    key: API_KEY,
    part: 'id,contentDetails,statistics',
    id
  });
  return res.data;

}

const runScript = async () => {
  try {
    const channelId = '';
    const data = await playlist(channelId);
    console.log(JSON.stringify(data));
  } catch(e) {
    console.error(e);
  }
}

runScript();