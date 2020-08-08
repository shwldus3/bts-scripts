const fs = require('fs');
const _ = require('lodash');
const bts_datasource = require('./bts_datasource');

// 1. json 파일 읽기 [완료]
// 2. filtering 전처리
// ㄴ 중복, Japanese Version, 동일한 곡의 피쳐링(Feat), remix 제거
// 3. 필요한 앨범 정보만 추출 (중복 제거)
// 4. 필요한 트랙 정보만 추출 (앨범ID 매핑, 중복 제거)

const getTracks = exports.getTracks = () => {
    console.log(__dirname);
    try {
        const json = fs.readFileSync(`${__dirname}/json/bts_tracks.json`, 'utf-8');
        const data = JSON.parse(json);
        return data.response.result.tracks;
    } catch (err) {
        throw err;
    }
}

const getTrackDetails = exports.getTrackDetails = () => {
    try {
        const json = fs.readFileSync(`${__dirname}/json/track_details.json`, 'utf-8');
        return JSON.parse(json).data;
    } catch (err) {
        throw err;
    }
}
const notFilteredTracks = exports.notFilteredTracks = (tracks) => {
    return tracks.map(t => {
        return {
            trackId: t.trackId,
            trackTitle: t.trackTitle,
            albumId: t.album.albumId,
            albumTitle: t.album.albumTitle
        };
    })
}

const filteredTracks = exports.filteredTracks = (tracks) => {
    if (!tracks) {
        throw new Error('Invalid tracks')
    }

    return tracks.reduce((prev, cur) => {
        const isFilterd = prev.find(t => {
            const title = cur.trackTitle;
            return t.trackTitle === title
                || title.includes('(Japanese Ver')
                || title.includes('-Japanese Version-')
                || title.includes('-Japanese ver.-')
                || title.includes('Digital Only')
                || title.includes('mix)')
                || title.includes('Mix)')
                || title.includes('remix')
                || title.includes('(Mo-Blue-Mix)')
                || title.includes('Remix');
        });

        if (!!isFilterd) {
            return prev;
        }

        if (prev.find(t => t.trackTitle.includes(cur.trackTitle) || cur.trackTitle.includes(t.trackTitle))) {
            if (cur.trackTitle.includes('Feat')) {
                return prev;
            }
            prev = prev.filter(p => !p.trackTitle.includes(cur.trackTitle));
        }

        prev.push({
            trackId: cur.trackId,
            trackTitle: cur.trackTitle,
            albumId: cur.album.albumId,
            albumTitle: cur.album.albumTitle
        });


        return prev;
    }, []);
}

const filterDupTitle = (tracks) => {
    return tracks.reduce((prev, cur) => {
        const isFiltered = prev.find(t => {
            return t.track_title === cur.track_title
        });
        if (!!isFiltered) {
            return prev;
        } else {
            prev.push(cur);
            return prev;
        }
    }, []);
}

/*
    track_title로 타류 분류
*/
const groupedTrackByType = exports.groupedTrackByType = (tracks) => {
    if (!tracks) {
        return;
    }
    const filteredTracks = filterDupTitle(tracks);

    const jpVerTracks = filteredTracks.filter(t => {
        const title = t.track_title;
        return title.includes('(Japanese Ver')
            || title.includes('-Japanese Version-')
            || title.includes('-Japanese ver.-');
    });

    const mixTracks = filteredTracks.filter(t => {
        const title = t.track_title;
        return (title.includes('mix)')
            || title.includes('prologue mix')
            || title.includes('Mix)')
            || title.includes('remix')
            || title.includes('(Mo-Blue-Mix)')
            || title.includes('Remix'))
            && !title.includes('Japanese Version') && !title.includes('(Feat. Lauv)');
    });

    const filteredTracks2 = filteredTracks.filter(t => {
        let isJpVer = false;
        let isMix = false;
        jpVerTracks.forEach(j => {
            if (j.track_title === t.track_title) {
                isJpVer = true;
            }
        });
        mixTracks.forEach(m => {
            if (m.track_title === t.track_title) {
                isMix = true;
            }
        });
        return !(isJpVer || isMix);
    })
    const featTracks = filteredTracks2.filter(t => {
        const title = t.track_title;
        return title.includes('Feat') &&
            (!title.includes('BTS Cypher PT.3 : KILLER') || !title.includes('Intro : 2 Cool 4 Skool'));
    });

    const fullEditionTracks = filteredTracks2.filter(t => {
        const title = t.track_title;
        return title.includes('Full Length Edition')
            || title.includes('full length edition');
    })

    const newTracks = filteredTracks.filter(t => {
        let isJpVer = false;
        let isMix = false;
        let isFeat = false;
        let isFullVer = false;
        jpVerTracks.forEach(j => {
            if (j.track_title === t.track_title) {
                isJpVer = true;
            }
        });
        mixTracks.forEach(m => {
            if (m.track_title === t.track_title) {
                isMix = true;
            }
        });
        featTracks.forEach(f => {
            if (f.track_title === t.track_title) {
                isFeat = true;
            }
        });
        fullEditionTracks.forEach(f => {
            if (f.track_title === t.track_title) {
                isFullVer = true;
            }
        })
        return !(isJpVer || isMix || isFeat || isFullVer);
    })


    return [
        {
            name: '일본 버전',
            value: jpVerTracks
        },
        {
            name: '리믹스',
            value: mixTracks
        },
        {
            name: '피쳐링(Feat.)',
            value: featTracks
        },
        {
            name: '풀 버전(Full Length Edition)',
            value: fullEditionTracks
        },
        {
            name: '신곡',
            value: newTracks
        },
    ]
}

const groupedByAlbum = exports.groupedByAlbum = (tracks) => {
    if (!tracks) {
        throw new Error('Invalid tracks')
    }

    const groupedByAlbum = {};
    tracks.forEach(t => {
        const album_id = t.albumId;
        if (groupedByAlbum[album_id]) {
            return;
        }
        groupedByAlbum[album_id] = {
            albumId: t.albumId,
            albumTitle: t.albumTitle
        };
    });

    return groupedByAlbum;
}

const writeTracks = exports.writeTracks = (data) => {
    const filePath = `${__dirname}/json/tracks.json`;
    const tracks = data.map(t => { return { trackId: t.trackId, trackTitle: t.trackTitle, albumId: t.albumId }; });

    try {
        fs.writeFileSync(filePath, JSON.stringify({ data: tracks }));
    } catch (err) {
        throw err;
    }
}

const writeAlbums = exports.writeAlbums = (data) => {
    const filePath = `${__dirname}/json/albums.json`;
    const groupedTracks = groupedByAlbum(data);
    const albums = Object.values(groupedTracks);

    try {
        fs.writeFileSync(filePath, JSON.stringify({ data: albums }));
    } catch (err) {
        throw err;
    }
}

const getWriters = exports.getWriters = (data, members) => {
    const writers = [];
    data.forEach(d => {
        const dWriters = d.lyricWriters;
        dWriters.forEach(w => {
            const member = members.filter(m => m.memberName.includes(w.lyricWriterName));
            if (!member.length) {
                return;
            }

            writers.push({
                trackId: d.trackId,
                memberId: member[0].memberId
            })
        })
    });
    return writers;
}

const getComposers = exports.getComposers = (data, members) => {
    const composers = [];
    data.forEach(d => {
        const dComposers = d.composers;
        dComposers.forEach(dc => {
            const member = members.filter(m => m.memberName.includes(dc.composerName));
            if (!member.length) {
                return;
            }

            const m = member[0];

            const isDup = composers.find(c => {
                return c.trackId === d.trackId && c.memberId === m.memberId;
            });
            if (!!isDup) {
                return;
            }

            composers.push({
                trackId: d.trackId,
                memberId: m.memberId
            })
        })
    });
    return composers;
}

// 데이터 살펴보고 직접 추출 
const getMembers = exports.getMembers = () => {
    return [
        {
            memberId: 274317,
            memberName: 'RM'
        },
        {
            memberId: 274319,
            memberName: '진(Jin)'
        },
        {
            memberId: 274318,
            memberName: '슈가|SUGA'
        },
        {
            memberId: 274322,
            memberName: '제이홉'
        },
        {
            memberId: 274325,
            memberName: '지민'
        },
        {
            memberId: 274326,
            memberName: 'V'
        },
        {
            memberId: 274327,
            memberName: '정국'
        }
    ];
}

const _runTest = () => {
    try {
        const tracks = getTrackDetails();
        const members = getMembers();
        // const writers = getWriters(tracks, members);
        const composers = getComposers(tracks, members);

        try {
            fs.writeFileSync(`${__dirname}/json/composers.json`, JSON.stringify({ data: composers }));
        } catch (err) {
            if (err) return console.log(err);
        }
    } catch (err) {
        console.error(err);
    }
}

_runTest();