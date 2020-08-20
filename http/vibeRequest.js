'use strict';

const HttpClient = require('./HttpClient');
const fs = require('fs');

const getTracks = exports.getTracks = async (artistId, count = 100) => {
    try {
        const httpClient = new HttpClient();
        const url = `https://apis.naver.com/vibeWeb/musicapiweb/v1/artist/${artistId}/tracks`;
        const params = {
            "start": "1",
            "display": count,
            "sort": "popular"
        };
        return await httpClient.get(url, params);
    } catch(e) {
        console.error(e);
    }
}

const getTrackDetail = exports.getTrackDetail = async (trackId) => {
    try {
        const httpClient = new HttpClient();
        const url = `https://apis.naver.com/vibeWeb/musicapiweb/track/${trackId}/info`;
        const res = await httpClient.get(url);
        return res.response.result.trackInformation;
    } catch(e) {
        console.error(e);
    }
}

const getAlbumDetail = exports.getAlbumDetail = async (albumId) => {
    try {
        const httpClient = new HttpClient();
        const url = `https://apis.naver.com/vibeWeb/musicapiweb/vibe/v1/album/${albumId}`;
        const param = {
            includeDesc: true
        }
        const res = await httpClient.get(url, param);
        return res.response.result.album;
    } catch(e) {
        console.error(e);
    }
}

const _saveFileFortracks = async () => {
    const data = await getTracks();
    const filePath = `${__dirname}/json/exo/tracks.json`;
    console.log(filePath);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data));
        console.log(`write file >>> ${filePath}`);
    } catch(err) {
        if (err) return console.log(err);
    }
}



const _runTest = async () => {
    const data = await getAlbumDetail(394744);
    // const data = await getTrackDetail(3829589);
    console.log(data);
}