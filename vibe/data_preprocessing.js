const fs = require('fs');
const _ = require('lodash');

// 1. json 파일 읽기 [완료]
// 2. filtering 전처리
// ㄴ 중복, Japanese Version, 동일한 곡의 피쳐링(Feat), remix 제거
// 3. 필요한 앨범 정보만 추출 (중복 제거)
// 4. 필요한 트랙 정보만 추출 (앨범ID 매핑, 중복 제거)

const getTracks = exports.getTracks = () => {
    try {
        const json = fs.readFileSync('./json/bts_tracks.json', 'utf-8');
        const data = JSON.parse(json);
        return data.response.result.tracks;
    } catch (err) {
        throw err;
    }
}

const getTrackDetails = exports.getTrackDetails = () => {
    try {
        const json = fs.readFileSync('./json/track_details.json', 'utf-8');
        return JSON.parse(json).data;
    } catch (err) {
        throw err;
    }
}

const filterTracks = exports.filterTracks = (tracks) => {
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
    const filePath = './json/tracks.json';
    const tracks = data.map(t => { return { trackId: t.trackId, trackTitle: t.trackTitle, albumId: t.albumId }; });

    try {
        fs.writeFileSync(filePath, JSON.stringify({ data: tracks }));
    } catch (err) {
        throw err;
    }
}

const writeAlbums = exports.writeAlbums = (data) => {
    const filePath = './json/albums.json';
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
        const members = getMembers();

        try {
            fs.writeFileSync('./json/members.json', JSON.stringify({ data: members }));
        } catch (err) {
            if (err) return console.log(err);
        }
    } catch (err) {
        console.error(err);
    }
}
