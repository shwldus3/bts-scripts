'use strict';

const fs = require('fs');
const _ = require('lodash');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const query = require('./query');
const preprocessing = require('./preprocessing');

const albumList = async () => {
    const data = await query.selectAlbums();
    console.log(data);
};

const filterNewTrack = (tracks) => {
    return preprocessing.groupedTrackByType(tracks).filter(t => t.name === '신곡')[0].value
};

const groupedTrack = async () => {
    const groupedTrack = await query.selectGroupedType();
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
};

const groupedTracksByYear = async () => {
    const tracks = await query.selectTrackWithReleaseDate();
    const newTracks = preprocessing.groupedTrackByType(tracks).filter(t => t.name === '신곡')[0].value;

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
};

const participateCompositionRatio = async () => {
    const results = await query.selectTrackWithMemberComposer();
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
    const results = await query.selectTrackWithMemberWriter();
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
    const results = await query.countParticipateByReleaseDate();
    return results;
};

const groupedParticipateByReleaseDateAndMember = async () => {
    const results = await query.countParticipateByReleaseDateAndMember();
    return results;
};

const groupedParticipateByMember = async () => {
    const results = await query.rateParticipateByMember();
    return results;
};

const getTop10Keywords = async () => {
    const data = await query.selectTop10Keywords();
    return data.map((d, idx) => {
        d.id = idx + 1;
        d.value = Number.parseInt(d.value);
        return d;
    });
};

const getKeywordsByReleaseDate = async () => {
    const data = await query.selectKeywordsByReleaseDate();
    const maxCnts = 30 
    let cnt = 0;
    let releaseDate = '';
    const results = [];
    data.forEach(d => {
        if (!releaseDate || releaseDate !== d.date) {
            releaseDate = d.date;
            cnt = 0;
            d.value = Number.parseInt(d.value);
            results.push(d);
            cnt++;
            return;
        }

        if (cnt < maxCnts) {
            d.value = Number.parseInt(d.value);
            results.push(d);
            cnt++;
        }

        return;
    });

    return results;
};

const getKeywords = async () => {
    const data = await query.selectKeywords();
    const filteredData = data.filter(r => {
        let word = r.lyric_word;
        
        if (/[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+[々〆〤]+/u.test(word)) {
            return;
        }

        // 한글 필터링 
        const filterList = ['말','꿈','날','눈','랩','끝','숨','밤','빛','앞','뷔','형'
            ,'삶','겁','흥','춤','꽃','별','땀','법','밖','힘','널','죄','욕','총','정'
            ,'밥','칼','낮','금','숲','봄','팬','쫌','빵','핳','헤','글','ㅋ','ㅇ','슛'
            ,'꿀','뜻','몫','벽','볕','빚','술','힣','짝','짱','넌', 
            , '뭐', '뭣', '왜', '쉿'
            // , '나', '너'
            , '니', '내'
        ];

        return word.length >= 2 
            || (word.length === 1 && filterList.includes(word));
    })
    let str = '';
    filteredData.forEach(d => {
        if (!d || !d.lyric_word) return;
        const word = d.lyric_word;
       
        str += `${word} `;
    });
    return str;
};

const writeCsv = async (data, keys, csvFileName) => {
    try {
        const header = [];
        keys.map(key => {
            header.push({
                id: key, title: key
            })
        });
        const csvWriter = createCsvWriter({
            path: `vibe/csv/${csvFileName}.csv`,
            header
        });
        await csvWriter.writeRecords(data);
    } catch (err) {
        throw new Error(err);
    }
};

const writeFile = (data, fileName) => {
    const filePath = `${__dirname}/${fileName}`;

    try {
        fs.writeFileSync(filePath, data);
    } catch (err) {
        throw err;
    }
};

const _runTest = async () => {
    try {
        const data = await getKeywordsByReleaseDate();
        // console.log(data);
        writeCsv(data, ['date', 'name', 'value', 'category'], 'getKeywordsByReleaseDate')
        // writeFile(data, 'keywords');
    } catch (err) {
        console.error(err);
    }
};

_runTest();