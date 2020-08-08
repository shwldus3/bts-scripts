'use strict';

const fs = require('fs');
const bts_datasource = require('./bts_datasource');
const data_preprocessing = require('./data_preprocessing');
const request_vibe_api = require('./vibe_api');

const saveAlbums = exports.saveAlbums = async () => {
    const albums = JSON.parse(fs.readFileSync(`${__dirname}/json/albums.json`, 'utf-8')).data;
    return runWithErrorCheck(albums, bts_datasource.insertAlbum);
}

const saveTracks = exports.saveTracks = async () => {
    const tracks = JSON.parse(fs.readFileSync(`${__dirname}/json/tracks.json`, 'utf-8')).data;
    return runWithErrorCheck(tracks, bts_datasource.insertTrack);
}

const saveMembers = exports.saveMembers = async () => {
    const members = JSON.parse(fs.readFileSync(`${__dirname}/json/members.json`, 'utf-8')).data;
    return runWithErrorCheck(members, bts_datasource.insertMember);
}

const saveWriters = exports.saveWriters = async () => {
    const writers = JSON.parse(fs.readFileSync(`${__dirname}/json/writers.json`, 'utf-8')).data;
    console.log(writers);
    return runWithErrorCheck(writers, bts_datasource.insertWriter);
}

const saveComposers = exports.saveComposers = async () => {
    const composers = JSON.parse(fs.readFileSync(`${__dirname}/json/composers.json`, 'utf-8')).data;
    return runWithErrorCheck(composers, bts_datasource.insertComposer);
}

const addDupType = async () => {
    const tracks = await bts_datasource.selectTracks();
    const groupedTracks = data_preprocessing.groupedTrackByType(tracks);
    const result = [];
    result.concat(await runWithErrorCheck(groupedTracks[0].value, bts_datasource.updateType, {type: 'J'}));
    result.concat(await runWithErrorCheck(groupedTracks[1].value, bts_datasource.updateType, {type: 'M'}));
    result.concat(await runWithErrorCheck(groupedTracks[2].value, bts_datasource.updateType, {type: 'F'}));
    result.concat(await runWithErrorCheck(groupedTracks[3].value, bts_datasource.updateType, {type: 'E'}));
    result.concat(await runWithErrorCheck(groupedTracks[4].value, bts_datasource.updateType, {type: 'N'}));
    return result;
}

const runWithErrorCheck = async (targets, runFunc, additionalData) => {
    const errResult = [];
    for (const d of targets) {
        let data = d;
        if (!!additionalData) {
            data = Object.assign(data, additionalData);
        }
        try {
            console.log(data);
            await runFunc(data);
        } catch (err) {
            console.log(err);
            errResult.push({
                data,
                err
            });
        }
    }
    return errResult;
}

const updateAlbum = exports.updateAlbum = async () => {
    const albums = JSON.parse(fs.readFileSync(`${__dirname}/json/albums.json`, 'utf-8')).data;
    const errResult = [];
    for (const d of albums) {
        try {
            const album = await request_vibe_api.getAlbumDetail(d.albumId);
            await bts_datasource.updateReleaseDate(album);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
}

const updateTrack = exports.updateTrack = async () => {
    const tracks = await bts_datasource.selectNewTracks();
    const errResult = [];
    const trackDetails = [];
    for (const d of tracks) {
        try {
            const track = await request_vibe_api.getTrackDetail(d.track_id);
            trackDetails.push(track);
            await bts_datasource.updatelyric(track);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
    try {
        fs.writeFileSync(`${__dirname}/json/track_details.json`, JSON.stringify({ data: trackDetails }));
    } catch (err) {
        throw err;
    } 
    return errResult;
}

const _runTest = async () => {
    const result = await saveComposers();

    if (!result.length) {
        console.log('정상적으로 완료했습니다.');
        return;
    }
    console.log('비정상 종료된 데이터 >>> ', result.length);

    const filePath = `${__dirname}/result/saveComposers.json`;
    try {
        fs.writeFileSync(filePath, JSON.stringify(result));
    } catch (err) {
        throw err;
    }
}

_runTest();