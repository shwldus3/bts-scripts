'use strict';

const fs = require('fs');
const query = require('./query');
const util = require('./util');

const albumList = async (id) => {
    return await query.selectAlbumsReleaseDate(id);
};

const groupedTrack = async (artistId) => {
    const groupedTrack = await query.selectGroupedType(artistId);
    return groupedTrack.map(t => {
        t.name = util.classifyType(t.type);
        return t;
    })
};

const groupedTrackByArtist = async () => {
    const exoData = (await query.selectGroupedType(272211)).map(t => {
        t.name = util.classifyType(t.type);
        return t;
    })
    const got7Data = (await query.selectGroupedType(314487)).map(t => {
        t.name = util.classifyType(t.type);
        return t;
    })
    const btsData = (await query.selectGroupedType(143179)).map(t => {
        t.name = util.classifyType(t.type);
        return t;
    })

    return {
        name: 'data',
        children: [{
            name: 'EXO',
            children: exoData
        }, {
            name: 'GOT7',
            children: got7Data
        }, {
            name: 'BTS',
            children: btsData
        }]
    }
};

const groupedTrackRatio = async (artistId) => {
    const groupedTrack = await query.selectRatioGroupedType(artistId);
    return groupedTrack.map(t => {
        t.name = util.classifyType(t.type);
        return t;
    })
};

const groupedTracksByYear = async (artistId) => {
    return await query.selectTrackWithReleaseDate(artistId);
};

const participateCompositionRatio = async (artistId) => {
    const results = await query.selectTrackWithMemberComposer(artistId);
    const tracksWithMember = results[0];
    return [{
        name: '멤버 작곡 참여 비율',
        value: tracksWithMember.participate_ratio
    }, {
        name: '멤버 작곡 비참여 비율',
        value: tracksWithMember.non_participate_ratio
    }]
};

const participateCompositionRatioByArtist = async () => {
    return await query.selectTrackWithMemberComposerByArtist();
};

const participateWriterRatioByArtist = async () => {
    return await query.selectTrackWithMemberWriterByArtist();
};

const participateWriterRatio = async (artistId) => {
    const results = await query.selectTrackWithMemberWriter(artistId);
    const tracksWithMember = results[0];
    return [{
        name: '멤버 작사 참여 비율',
        value: tracksWithMember.participate_ratio
    }, {
        name: '멤버 작사 비참여 비율',
        value: tracksWithMember.non_participate_ratio
    }]
};

const groupedParticipateByArtistReleaseDate = async () => {
    const exoData = await query.countParticipateByReleaseDate(272211)
    const got7Data = await query.countParticipateByReleaseDate(314487)
    const btsData = await query.countParticipateByReleaseDate(143179)

    const result = [];
    btsData.forEach(b => {
        const exo = exoData.find(e => e.date === b.date);
        const got7 = got7Data.find(g => g.date === b.date);

        result.push({
            date: b.date, 
            BTS: b.value, 
            EXO: !!exo ? exo.value : "0",
            GOT7: !!got7 ? got7.value : "0",
        })
    })
    return result;
};

const groupedParticipateByReleaseDate = async (artistId) => {
    return await query.countParticipateByReleaseDate(artistId);
};

const groupedParticipateByReleaseDateAndMember = async (artistId) => {
    return await query.countParticipateByReleaseDateAndMember(artistId);
};

const groupedParticipateRatioByReleaseDate = async (artistId) => {
    return await query.ratioParticipateByReleaseDate(artistId);
};

const groupedParticipateRatioByReleaseDateAndMember = async (artistId) => {
    return await query.ratioParticipateByReleaseDateAndMember(artistId);
};

const groupedParticipateRaioByMember = async (artistId) => {
    return await query.rateParticipateByMember(artistId);
};

const getTop10Keywords = async (artistId) => {
    const data = await query.selectTopNKeywords(artistId, 10);
    return data.map((d, idx) => {
        d.id = idx + 1;
        d.value = Number.parseInt(d.value);
        return d;
    });
};

const getTop50KeywordsByArtist = async () => {
    const exoKeywords = await query.selectTopNKeywords(272211,50); 
    const btsKeywords = await query.selectTopNKeywords(143179,50);
    const got7Keywords = await query.selectTopNKeywords(314487,50);

    const result = [];
    btsKeywords.forEach(k => {
        result.push({
            id: `키워드.BTS.${k.data}`,
            value: k.value
        });
    })
    exoKeywords.forEach(k => {
        result.push({
            id: `키워드.EXO.${k.data}`,
            value: k.value
        });
    });
    got7Keywords.forEach(k => {
        result.push({
            id: `키워드.GOT7.${k.data}`,
            value: k.value
        });
    });

    return result;
}

const getOnlyBTSKeywords = async () => {
    const exoKeywords = await query.selectKeywordsWithFiltered(272211); 
    const btsKeywords = await query.selectKeywordsWithFiltered(143179);
    const got7Keywords = await query.selectKeywordsWithFiltered(314487);

    const onlyBTS = [];
    btsKeywords.forEach(k => {
        if (!!exoKeywords.find(e => e.data === k.data)) {
            return;
        }
        if (!!got7Keywords.find(g => g.data === k.data)) {
            return;
        }
        const obj = {
            word: k.data,
            category: 1,
            weight: k.value
        };
        onlyBTS.push(obj);
    })
    return onlyBTS;
}

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


const _run = async () => {
    try {
        // const key = 'exo';
        // const artistId = 272211;

        // const key = 'got7';
        // const artistId = 314487;

        const key = 'bts';
        const artistId = 143179; 

        const data = await albumList(artistId); // 그동안 발매한 BTS 앨범 리스트
        const data = await groupedTrack(artistId); // BTS 곡 분류 별 개수
        const data = await groupedTracksByYear(artistId); // BTS 앨범 발매일 별 신곡 개수
        
        const data = await participateCompositionRatio(artistId); // BTS 작곡 참여도
        const data = await participateWriterRatio(artistId); // BTS 작사 참여도
        const data = await groupedParticipateByReleaseDate(artistId); // 기간(년) 별 BTS 작곡/작사 참여 곡 개수
        const data = await groupedParticipateByReleaseDateAndMember(artistId); // 기간(년) 별 BTS 멤버 각각의 작곡/작사 참여 곡 개수

        const data = await groupedTrackByArtist(); // 아티스트 별 곡 분류 별 개수
        const data = await participateCompositionRatioByArtist(); // 아티스트 별 작곡 참여도
        const data = await participateWriterRatioByArtist(); // 아티스트 별 작사 참여도
        const data = await groupedParticipateByArtistReleaseDate(); // 아티스트 별 기간(년) 별 BTS 작곡/작사 참여 곡 개수

        const data = await getTop10Keywords(artistId); // 키워드 Top 10
        const data = await getKeywords(); // 아티스트 별 키워드 추출
        const data = await getKeywordsByReleaseDate(); // BTS 앨범 발매일 별 가사 키워드
        const data = await getTop50KeywordsByArtist();// 아티스트 별 가사 키워드 빈도수 Top50 
        const data = await getOnlyBTSKeywords();// BTS only 가사 키워드 (EXO, GOT7 중복 키워드 제거)

        // await util.writeCsv(data, ['word', 'category', 'weight'], 'getOnlyBTSKeywords', key);

        // util.writeFile(JSON.stringify(data), key, 'getOnlyBTSKeywords.json');

        console.log('완료');
    } catch (err) {
        console.error(err);
    }
};

_run();