const fs = require('fs');
const bts_datasource = require('./bts_datasource');
const data_preprocessing = require('./data_preprocessing');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const _ = require('lodash')

const albumList = async () => {
    const data = await bts_datasource.selectAlbums();
    console.log(data);
}

const filterNewTrack = (tracks) => {
    return data_preprocessing.groupedTrackByType(tracks).filter(t => t.name === '신곡')[0].value
}

const groupedTrack = async () => {
    const groupedTrack = await bts_datasource.selectGroupedType();
    console.log(groupedTrack);
    return groupedTrack.map(t => {
        if (t.type === 'N') {
            t.name = '신곡';
        } else if (t.type === 'E') {
            t.name = '풀 버전';
        } else if (t.type === 'F') {
            t.name = '피쳐링';
        } else if (t.type === 'J') {
            t.name = '일본 버전';
        } else if (t.type === 'M') {
            t.name = '리믹스';
        }
    })
}

const groupedTracksByYear = async () => {
    const tracks = await bts_datasource.selectTrackWithReleaseDate();
    const newTracks = data_preprocessing.groupedTrackByType(tracks).filter(t => t.name === '신곡')[0].value;

    const groupedByReleaseDate = _.countBy(newTracks, 'release_date');
    const result = [];
    for (const key in groupedByReleaseDate) {
        if (groupedByReleaseDate.hasOwnProperty(key)) {
            const value = groupedByReleaseDate[key];
            result.push({
                date: key,
                value
            })
        }
    }
    return result;
}

const participateCompositionRatio = async () => {
    const results = await bts_datasource.selectTrackWithMemberComposer();
    const tracksWithMember = results[0];
    return [{
        name: '멤버 작곡 참여 비율',
        value: tracksWithMember.participate_ratio
    }, {
        name: '멤버 작곡 비참여 비율',
        value: tracksWithMember.non_participate_ratio
    }]
};

const participateWriterRatio = async () => {
    const results = await bts_datasource.selectTrackWithMemberWriter();
    const tracksWithMember = results[0];
    return [{
        name: '멤버 작사 참여 비율',
        value: tracksWithMember.participate_ratio
    }, {
        name: '멤버 작사 비참여 비율',
        value: tracksWithMember.non_participate_ratio
    }]
};

const groupedParticipateByReleaseDate = async () => {
    const results = await bts_datasource.countParticipateByReleaseDate();
    console.log(results);
    return results;
}

const groupedParticipateByReleaseDateAndMember = async () => {
    const results = await bts_datasource.countParticipateByReleaseDateAndMember();
    console.log(results);
    return results;
}

const _runTest = async () => {
    try {
        const csvWriter = createCsvWriter({
            path: 'groupedParticipateByReleaseDateAndMember.csv',
            header: [
                { id: 'date', title: 'date' },
                { id: 'member', title: 'member' },
                { id: 'value', title: 'value' }
            ]
        });
        const data = await groupedParticipateByReleaseDateAndMember();
        console.log(data);
        await csvWriter.writeRecords(data);
    } catch (err) {
        console.error(err);
    }
}

_runTest();