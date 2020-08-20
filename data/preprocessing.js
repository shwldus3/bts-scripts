'use strict';

const filterDupTitle = (tracks) => {
    return tracks.reduce((prev, cur) => {
        const isFiltered = prev.find(t => {
            return t.trackTitle === cur.trackTitle
        });
        if (!!isFiltered) {
            return prev;
        } else {
            prev.push(cur);
            return prev;
        }
    }, []);
};

/*
    trackTitle로  분류 트랙 유형 분류
*/
const groupedTrackByType = exports.groupedTrackByType = (tracks) => {
    if (!tracks) {
        return;
    }
    const filteredTracks = filterDupTitle(tracks);

    const otherVerTracks = filteredTracks.filter(t => {
        const title = t.trackTitle;
        return title.includes('Japan')
            || title.includes('Ver.)')
            || title.includes('ver.)')
            || title.includes('ver)');
    });

    const mixTracks = filteredTracks.filter(t => {
        const title = t.trackTitle;
        return (title.includes('mix)')
            || title.includes('Mix)')
            || title.includes('prologue mix')
            || title.includes('remix')
            || title.includes('Remix'))
            || title.includes('(Mo-Blue-Mix)')
            && !title.includes('Japan') && !title.includes('(Feat. Lauv)');
    });

    const filteredTracks2 = filteredTracks.filter(t => {
        let isJpVer = false;
        let isMix = false;
        otherVerTracks.forEach(j => {
            if (j.trackTitle === t.trackTitle) {
                isJpVer = true;
            }
        });
        mixTracks.forEach(m => {
            if (m.trackTitle === t.trackTitle) {
                isMix = true;
            }
        });
        return !(isJpVer || isMix);
    });
    const featTracks = filteredTracks2.filter(t => {
        const title = t.trackTitle;
        return title.includes('Feat') &&
            (!title.includes('BTS Cypher PT.3 : KILLER') || !title.includes('Intro : 2 Cool 4 Skool'));
    });

    const fullEditionTracks = filteredTracks2.filter(t => {
        const title = t.trackTitle;
        return title.includes('Full Length Edition')
            || title.includes('full length edition');
    });

    const newTracks = filteredTracks.filter(t => {
        let isJpVer = false;
        let isMix = false;
        let isFeat = false;
        let isFullVer = false;
        otherVerTracks.forEach(j => {
            if (j.trackTitle === t.trackTitle) {
                isJpVer = true;
            }
        });
        mixTracks.forEach(m => {
            if (m.trackTitle === t.trackTitle) {
                isMix = true;
            }
        });
        featTracks.forEach(f => {
            if (f.trackTitle === t.trackTitle) {
                isFeat = true;
            }
        });
        fullEditionTracks.forEach(f => {
            if (f.trackTitle === t.trackTitle) {
                isFullVer = true;
            }
        });
        return !(isJpVer || isMix || isFeat || isFullVer);
    });


    return [
        {
            name: '다른 버전(외국어, 어쿠스틱 등)',
            value: otherVerTracks.map(t => { t.type = 'J'; return t; })
        },
        {
            name: '리믹스',
            value: mixTracks.map(t => { t.type = 'M'; return t; })
        },
        {
            name: '피쳐링(Feat.)',
            value: featTracks.map(t => { t.type = 'F'; return t; })
        },
        {
            name: '풀 버전(Full Length Edition)',
            value: fullEditionTracks.map(t => { t.type = 'E'; return t; })
        },
        {
            name: '신곡',
            value: newTracks.map(t => { t.type = 'N'; return t; })
        },
    ]
};

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
};

const getWriters = exports.getWriters = (data, members) => {
    const writers = [];
    data.forEach(d => {
        const dWriters = d.lyricWriters;
        dWriters.forEach(w => {
            const member = members.filter(m => m.memberId === w.lyricWriterId);
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
};

const getComposers = exports.getComposers = (data, members) => {
    const composers = [];
    data.forEach(d => {
        const dComposers = d.composers;
        dComposers.forEach(dc => {
            const member = members.filter(m => m.memberId = dc.composerId);
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
};

const _runTest = () => {
    try {
        const tracks = getTrackDetails();
        // const members = getMembers();
        // const writers = getWriters(tracks, members);
        // const composers = getComposers(tracks, members);

        // try {
        //     fs.writeFileSync(`${__dirname}/json/composers.json`, JSON.stringify({ data: composers }));
        // } catch (err) {
        //     if (err) return console.log(err);
        // }
    } catch (err) {
        console.error(err);
    }
};
