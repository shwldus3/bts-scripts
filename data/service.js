'use strict';

const fs = require('fs');
const query = require('./query');
const preprocessing = require('./preprocessing');
const vibe_api = require('./vibe_api');
const constant = require('./constant');

const getTracksRawData = async (id, artist, count) => {
    const data = await vibe_api.getTracks(id, count);
    try {
        const filePath = `${__dirname}/json/${artist}/tracks.json`;
        fs.writeFileSync(filePath, JSON.stringify(data));
        console.log(`Finished! Write file at ${filePath}`);
    } catch (err) {
        throw err;
    }
};

const updateAlbumReleaseDate = exports.updateAlbum = async (id) => {
    const albums = await query.selectAlbumsByArtistId(id);
    const errResult = [];
    for (const d of albums) {
        try {
            const album = await vibe_api.getAlbumDetail(d.album_id);
            await query.updateReleaseDate(album);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
}

const updateTrackLyric = exports.updateTrack = async (id, artist) => {
    const tracks = await query.selectNewTracks(id);
    const errResult = [];
    const trackDetails = [];
    for (const d of tracks) {
        try {
            const track = await vibe_api.getTrackDetail(d.track_id);
            trackDetails.push(track);
            await query.updatelyric(track);
        } catch (err) {
            console.log(err);
            errResult.push({
                data: d,
                err
            });
        }
    }
    try {
        fs.writeFileSync(`${__dirname}/json/${artist}/track_details.json`, JSON.stringify({ data: trackDetails }));
    } catch (err) {
        throw err;
    }
    return errResult;
}

const runWithErrorCheck = async (targets, runFunc, additionalData) => {
    const errResult = [];
    for (const d of targets) {
        let data = d;
        if (!!additionalData) {
            data = Object.assign(data, additionalData);
        }
        try {
            await runFunc(data);
        } catch (err) {
            errResult.push({
                data,
                err
            });
        }
    }
    if (!!errResult || !!errResult.length) {
        fs.writeFileSync(`${__dirname}/result/error.json`, JSON.stringify(errResult));
    }
}

const getTrackDetails = exports.getTrackDetails = (artist) => {
    try {
        const json = fs.readFileSync(`${__dirname}/json/${artist}/track_details.json`, 'utf-8');
        return JSON.parse(json).data;
    } catch (err) {
        throw err;
    }
}

const albumTrackService = async (id, artist) => {
    const tracks = preprocessing.transformTracks(artist);
    
    const groupedAlbums = preprocessing.groupedByAlbum(tracks);
    const albums = Object.values(groupedAlbums).map(a => { a.artist_id = id; return a;});
    runWithErrorCheck(albums, query.insertAlbum);

    const groupedTracks = preprocessing.groupedTrackByType(tracks);
    const trackInfos = groupedTracks.reduce((prev, cur) => {
        prev = prev.concat(cur.value);
        return prev;
    }, []);
    runWithErrorCheck(trackInfos, query.insertTrack);
    
    await updateAlbumReleaseDate(artistId);
    await updateTrackLyric(artistId, artist)

    console.log('완료');
}

const composerWriterService = async (artistId, artist, members) => {
    await runWithErrorCheck(members, query.insertMember, { artistId: artistId });
    const trackDetails = getTrackDetails(artist);
    const writers = preprocessing.getWriters(trackDetails, members)
    const composers = preprocessing.getComposers(trackDetails, members)
    await runWithErrorCheck(writers, query.insertWriter)
    await runWithErrorCheck(composers, query.insertComposer)
}

const btsService = async () => {
    const artist = 'bts'
    const artistId = 143179;
    const count = 300

    try {
        getTracksRawData(artistId, artist, count);
        albumTrackService(artistId, artist, count);
        const members = constant.getBTSMembers();
        composerWriterService(artistId, artist, members);
    } catch (err) {
        throw err;
    }
}

const exoService = async () => {
    const artist = 'exo'
    const artistId = 272211;
    const count = 500

    try {
        await getTracksRawData(artistId, artist, count);
        albumTrackService(artistId, artist, count);
        const members = constant.getEXOMembers();
        composerWriterService(artistId, artist, members);
    } catch (err) {
        throw err;
    }
}

const got7Service = async () => {
    const artist = 'got7'
    const artistId = 314487;
    const count = 200

    try {
        await getTracksRawData(artistId, artist, count);
        albumTrackService(artistId, artist, count);
        const members = constant.getGOT7Members();
        composerWriterService(artistId, artist, members);
    } catch (err) {
        throw err;
    }
}

const _runTest = () => {
    try {
        // btsService();

        // exoService();

        // got7Service();

    } catch (err) {
        console.error(err);
    }
}

_runTest();