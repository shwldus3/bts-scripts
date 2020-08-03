'use strict';

const fs = require('fs');
const query_bts = require('./query_bts');
const request_vibe_api = require('./http/request_vibe_api');

const saveAlbums = exports.saveAlbums = async () => {
    const albums = JSON.parse(fs.readFileSync('./json/albums.json', 'utf-8')).data;
    return runWithErrorCheck(albums, query_bts.insertAlbum);
}

const saveTracks = exports.saveTracks = async () => {
    const tracks = JSON.parse(fs.readFileSync('./json/tracks.json', 'utf-8')).data;
    return runWithErrorCheck(tracks, query_bts.insertTrack);
}

const saveMembers = exports.saveMembers = async () => {
    const members = JSON.parse(fs.readFileSync('./json/members.json', 'utf-8')).data;
    return runWithErrorCheck(members, query_bts.insertMember);
}

const saveWriters = exports.saveWriters = async () => {
    const writers = JSON.parse(fs.readFileSync('./json/writers.json', 'utf-8')).data;
    return runWithErrorCheck(writers, query_bts.insertWriter);
}

const saveComposers = exports.saveComposers = async () => {
    const composers = JSON.parse(fs.readFileSync('./json/composers.json', 'utf-8')).data;
    return runWithErrorCheck(composers, query_bts.insertComposer);
}

const runWithErrorCheck = async (targets, runFunc) => {
    const errResult = [];
    for (const d of targets) {
        try {
            await runFunc(d);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
    return errResult;
}

const updateTrack = exports.updateTrack = async () => {
    const tracks = JSON.parse(fs.readFileSync('./json/tracks.json', 'utf-8')).data;
    const errResult = [];
    const trackDetails = [];
    for (const d of tracks) {
        try {
            const track = await request_vibe_api.getTrackDetail(d.trackId);
            trackDetails.push(track);
            await query_bts.updatelyric(track);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
    try {
        fs.writeFileSync('./json/track_details.json', JSON.stringify({ data: trackDetails }));
    } catch (err) {
        throw err;
    } 
    return errResult;
}

const _runTest = async () => {
    const result = await saveMembers();

    if (!result.length) {
        console.log('정상적으로 완료했습니다.');
        return;
    }
    console.log('비정상 종료된 데이터 >>> ', result.length);

    const filePath = './result/saveMembers.json';
    try {
        fs.writeFileSync(filePath, JSON.stringify(result));
    } catch (err) {
        throw err;
    }
}