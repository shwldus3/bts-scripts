'use strict';

const { google } = require('googleapis');

const youtube = google.youtube('v3');

// API_KEY 추가
const API_KEY = '';

const getPlaylist = exports.getPlaylist = async (playlistId) => {
  const res = await youtube.playlistItems.list({
    key: API_KEY,
    playlistId,
    part: 'id,snippet,contentDetails'
  });
  return res.data
}

const getVideo = exports.getVideo = async (videoId) => {
    const res = await youtube.videos.list({
        key: API_KEY,
        id: videoId,
        part: 'id,snippet,statistics'
      });
      return res.data 
}

const searchList = exports.searchList = async () => {
  const res = await youtube.search.list({
    key: API_KEY,
    part: 'id,snippet',
    q: 'ibighit',
  });
  return res.data;
};

const playlist = exports.playlist = async (channelId) => {
  const res = await youtube.playlists.list({
    key: API_KEY,
    channelId,
    part: 'id,snippet',
    maxResults: 20
  });
  return res.data;
}

const statistics = exports.statistics = async (id) => {
  const res = await youtube.channels.list({
    key: API_KEY,
    part: 'id,contentDetails,statistics',
    id
  });
  return res.data;
}

const _runScript1 = async () => {
  try {
    // Playlist 가져와서 집계할 대상 동영상만 리스트를 추리고 각 영상에 대한 상세 데이터를 가져옴

    // const playlistId = '';
    // const data = await getPlaylist(playlistId);

    const videoId = '';
    const data = await getVideo(videoId);
    console.log(JSON.stringify(data));
  } catch(e) {
    console.error(e);
  }
}

const _runScript2 = async () => {
  try {
    const channelId = '';
    const data = await playlist(channelId);
    console.log(JSON.stringify(data));
  } catch(e) {
    console.error(e);
  }
}