'use strict';

const { google } = require('googleapis');
const path = require('path');

// initialize the Youtube API library
const youtube = google.youtube('v3');

const API_KEY = '';

const getPlaylist = async (playlistId) => {
  const res = await youtube.playlistItems.list({
    key: API_KEY,
    playlistId,
    part: 'id,snippet,contentDetails'
  });
  return res.data
}

const getVideo = async (videoId) => {
    const res = await youtube.videos.list({
        key: API_KEY,
        id: videoId,
        part: 'id,snippet,statistics'
      });
      return res.data 
}

const runScript = async () => {
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

runScript();