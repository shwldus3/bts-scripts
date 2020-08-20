const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'bts',
    password: 'admin',
    port: 5432,
});

exports.updatelyric = async (trackInfo) => {
    const { trackId, lyric } = trackInfo;
    const data = [ lyric, trackId ];

    try {
        const results = await pool.query('UPDATE track SET lyric = $1 WHERE track_id = $2', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.updateType = async (trackInfo) => {
    const { track_id, type } = trackInfo;
    const data = [ type, track_id ];

    try {
        const results = await pool.query('UPDATE track SET type = $1 WHERE track_id = $2', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.updateReleaseDate = async (albumInfo) => {
    const { albumId, releaseDate } = albumInfo;
    const data = [ releaseDate, albumId ];

    try {
        const results = await pool.query('UPDATE album SET release_date = to_date($1, \'YYYY.MM.DD\') WHERE album_id = $2', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.insertAlbum = async (albumInfo) => {
    const { albumId, albumTitle, artist_id = null } = albumInfo;
    const data = [ albumId, albumTitle, artist_id ];

    try {
        const results = await pool.query('INSERT INTO album (album_id, album_title, artist_id) VALUES ($1, $2, $3)', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.insertTrack = async (trackInfo) => {
    const { trackId, trackTitle, lyric = null, albumId, type = 'D' } = trackInfo;
    const data = [ trackId, trackTitle, lyric, albumId, type ];

    try {
        const results = await pool.query('INSERT INTO track (track_id, track_title, lyric, album_id, type) VALUES ($1, $2, $3, $4, $5)', data);
        return results;
    } catch (err) {
        throw err
    }
}

exports.insertWriter = async (writerInfo) => {
    const { trackId, memberId } = writerInfo;
    const data = [ trackId, memberId ];

    try {
        const results = await pool.query('INSERT INTO writer (track_id, member_id) VALUES ($1, $2)', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.insertComposer = async (composerInfo) => {
    const { trackId, memberId } = composerInfo;
    const data = [ trackId, memberId ];

    try {
        const results = await pool.query('INSERT INTO composer (track_id, member_id) VALUES ($1, $2)', data);
        return results;
    } catch (err) {
        throw err
    }
};

exports.insertMember = async (memberInfo) => {
    const { memberId, memberName, artistId = null } = memberInfo;
    const data = [ memberId, memberName, artistId];

    try {
        const results = await pool.query('INSERT INTO member (member_id, member_name, artist_id) VALUES ($1, $2, $3)', data);
        return results;
    } catch (err) {
        throw err
    }
}

exports.selectMember = async (memberInfo) => {
    const { memberId } = memberInfo;
    const data = [ memberId ];

    try {
        const results = await pool.query('SELECT * FROM member WHERE member_id = $1', data);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectAlbumsByArtistId = async (id) => {
    try {
        const results = await pool.query('SELECT album_id FROM album WHERE artist_id = $1', [ id ]);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectAlbumsReleaseDate = async () => {
    try {
        const results = await pool.query('SELECT album_title, to_char("release_date", \'YYYY-MM-DD\') as release_date FROM album');
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectTracks = async () => {
    try {
        const results = await pool.query('SELECT * FROM track');
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectTrackTitle = async () => {
    try {
        const results = await pool.query('SELECT track_title FROM track');
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectNewTracks = async (id) => {
    try {
        const results = await pool.query('SELECT * FROM track as t, album as a where t.type = \'N\' AND t.album_id = a.album_id and a.artist_id = $1', [ id ]);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectGroupedType = async () => {
    try {
        const results = await pool.query('SELECT type, count(type) as value FROM track WHERE type != \'D\' group by type');
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectTrackWithReleaseDate = async () => {
    try {
        const results = await pool.query('SELECT t.track_title, to_char(a.release_date, \'YYYY\') as release_date FROM track as t, album as a where t.album_id = a.album_id');
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectTrackWithMemberComposer = async () => {
    const sql = `
    select t.ptp / (t.ptp + t.no_ptp) * 100 as participate_ratio
        , t.no_ptp / (t.ptp + t.no_ptp) * 100 as non_participate_ratio
    from (select CAST(SUM(CASE WHEN c.track_id IS NOT NULL THEN 1 ELSE 0 END) AS DOUBLE PRECISION) AS ptp
            , CAST(SUM(CASE WHEN c.track_id IS NULL THEN 1 ELSE 0 END) AS DOUBLE PRECISION) AS no_ptp 
        from track as t
            left join (
                select track_id 
                from composer as c 
                group by track_id
            ) as c on t.track_id = c.track_id
        WHERE t.type = 'N') as T
    `
    try {
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}
exports.selectTrackWithMemberWriter = async () => {
    const sql = `
    select t.ptp / (t.ptp + t.no_ptp) * 100 as participate_ratio
        , t.no_ptp / (t.ptp + t.no_ptp) * 100 as non_participate_ratio
    from (select CAST(SUM(CASE WHEN c.track_id IS NOT NULL THEN 1 ELSE 0 END) AS DOUBLE PRECISION) AS ptp
            , CAST(SUM(CASE WHEN c.track_id IS NULL THEN 1 ELSE 0 END) AS DOUBLE PRECISION) AS no_ptp 
        from track as t
            left join (
                select track_id 
                from writer as w
                group by track_id
            ) as c on t.track_id = c.track_id
        WHERE t.type = 'N') as T
    `
    try {
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.countParticipateByReleaseDate = async () => {
    try {
        const sql = `
        SELECT t.release_date AS date
            , COUNT(t.release_date) AS value
        FROM (
            SELECT TO_CHAR(a.release_date, 'YYYY') AS release_date 
            FROM album AS a
            JOIN track AS t ON a.album_id = t.album_id
            JOIN (
                SELECT p1.track_id
                FROM (
                    SELECT track_id 
                    FROM writer
                UNION
                    SELECT track_id 
                    FROM composer
                ) AS p1 
                GROUP BY p1.track_id
            ) AS p ON t.track_id = p.track_id
            WHERE t.type = 'N') t
        GROUP BY t.release_date
        ORDER BY t.release_date
        `

        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.countParticipateByReleaseDateAndMember = async () => {
    try {
        const sql = `
        SELECT t.release_date AS date
            , t.member_name AS member
            , COUNT(*) AS value
        FROM (
            SELECT CONCAT(TO_CHAR(a.release_date, 'YYYY'), '-01-01') AS release_date
                , m.member_name
            FROM album AS a
            JOIN track AS t ON a.album_id = t.album_id
            JOIN (
                SELECT p1.track_id, p1.member_id
                FROM (
                    SELECT *
                    FROM writer
                UNION
                    SELECT * 
                    FROM composer
                ) AS p1 
                GROUP BY p1.track_id, p1.member_id
            ) AS p ON t.track_id = p.track_id
            JOIN member AS m ON p.member_id = m.member_id
            WHERE t.type = 'N') t
        GROUP BY t.release_date, t.member_name
        ORDER BY t.release_date, t.member_name
        `

        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.rateParticipateByMember = async () => {
    try {
        const sql = `
        SELECT t.member_name AS member
            , CAST(COUNT(*) AS DOUBLE PRECISION) / 160 * 100 AS value 
        FROM (
            SELECT m.member_name
            FROM track AS t
            JOIN (
                SELECT p1.track_id, p1.member_id
                FROM (
                    SELECT *
                    FROM writer
                UNION
                    SELECT * 
                    FROM composer
                ) AS p1 
                GROUP BY p1.track_id, p1.member_id
            ) AS p ON t.track_id = p.track_id
            JOIN member AS m ON p.member_id = m.member_id
            WHERE t.type = 'N') t
        GROUP BY t.member_name
        ORDER BY t.member_name
        `

        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectKeywords = async () => {
    try {
        const sql = `
        SELECT lyric_word
        FROM lyric_morpheme
        WHERE type IN ('NNP', 'NNG', 'SN', 'IC')
             OR (type IN ('MAG', 'XR', 'SL') AND LENGTH(lyric_word) >= 2)
             OR (type IN ('VA') AND LENGTH(lyric_word) >= 3)
        `
        // SELECT lyric_word
        // FROM lyric_morpheme
        // WHERE type IN ('NNP', 'NNG', 'NP', 'SN', 'IC')
        //     OR (type IN ('MAG', 'XR', 'SL') AND LENGTH(lyric_word) >= 2)
        //     OR (type IN ('VA') AND LENGTH(lyric_word) >= 3)
        // `
        // const sql = `
        // SELECT track_id, lyric_word, type
        // FROM lyric_morpheme
        // `
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectTop10Keywords = async () => {
    try {
        const sql = `
        SELECT T.word AS data
            , count(*) AS value
        FROM (
            SELECT LOWER(l.lyric_word) AS word
                , l.type
            FROM lyric_morpheme as l
            WHERE 
                (
                    l.type IN ('NNP', 'NNG', 'SN')
                        OR (l.type IN ('XR', 'SL') AND LENGTH(lyric_word) >= 2)
                        OR (l.type IN ('VA') AND LENGTH(lyric_word) >= 3)
                )
                AND (LENGTH(l.lyric_word) >= 2 OR LENGTH(l.lyric_word) = 1
                    AND l.lyric_word IN ('말','꿈','날','눈','랩','끝','숨','밤','빛','앞','뷔','형'
                    ,'삶','겁','흥','춤','꽃','별','땀','법','밖','힘','널','죄','욕','총','정'
                    ,'밥','칼','낮','금','숲','봄','팬','쫌','빵','핳','헤','글','ㅋ','ㅇ','슛'
                    ,'꿀','뜻','몫','벽','볕','빚','술','힣','짝','짱','넌'
                    , '뭐', '뭣', '왜', '쉿'
                    , '니', '내', '나', '너')
                    )
                AND l.lyric_word !~ '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+[々〆〤]+/u'
        ) AS T
        GROUP BY T.word
        ORDER BY T.count DESC
        LIMIT 10
        `
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

exports.selectLyrics = async () => {
    const sql = `
        select REGEXP_REPLACE(lyric, '[[:alpha:]]|!|,|’|\(|\)|''', '','g') as korean_lyric
            , REGEXP_REPLACE(lyric, '[가-힣]|!|,|’|\(|\)|''', '', 'g') as english_lyric
            , track_id 
        from track where type = 'N' and lyric is not null limit 1
    `
    try {
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}


exports.selectKeywordsByReleaseDate = async () => {
    try {
        const sql = `
        SELECT T.release_date AS date
            , T.word AS name
            , release_date AS category
            , count(*) AS value
        FROM (
            SELECT LOWER(l.lyric_word) AS word
                , l.type
                , TO_CHAR(a.release_date, 'YYYY-MM-DD') AS release_date
            FROM album as a
                , track as t
                , lyric_morpheme as l
            WHERE a.album_id = t.album_id
                AND t.track_id = l.track_id
                AND (
                    l.type IN ('NNP', 'NNG', 'SN')
                        OR (l.type IN ('XR', 'SL') AND LENGTH(lyric_word) >= 2)
                        OR (l.type IN ('VA') AND LENGTH(lyric_word) >= 3)
                    )
                AND (LENGTH(l.lyric_word) >= 2 OR LENGTH(l.lyric_word) = 1
                    AND l.lyric_word IN ('말','꿈','날','눈','랩','끝','숨','밤','빛','앞','뷔','형'
                    ,'삶','겁','흥','춤','꽃','별','땀','법','밖','힘','널','죄','욕','총','정'
                    ,'밥','칼','낮','금','숲','봄','팬','쫌','빵','핳','헤','글','ㅋ','ㅇ','슛'
                    ,'꿀','뜻','몫','벽','볕','빚','술','힣','짝','짱','넌'
                    , '뭐', '뭣', '왜', '쉿'
                    , '니', '내')
                    )
                AND l.lyric_word NOT IN ('랩몬스터', '제이홉', '정호석', '지민', '슈가', '민윤기', '정국', '석진', '뷔', '김남준', '남준', '태형', '호석', '윤기')
                AND l.lyric_word !~ '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+[々〆〤]+/u'
        ) AS T
        GROUP BY T.release_date, T.word
        ORDER BY T.release_date, T.count DESC
        `
        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        throw err
    }
}

const _runTest = async () => {
    const albumInfo = {
        albumId: 4417123,
        albumTitle: 'MAP OF THE SOUL : 7'
    };

    const trackInfo = {
        trackId: 39766611,
        trackTitle: 'ON',
        lyric: "I can't understand what people are sayin' 어느 장단에 맞춰야 될지 한 발자국 떼면 한 발자국 커지는 shadow 잠에서 눈을 뜬 여긴 또 어디 어쩜 서울 또 New York or Paris 일어나니 휘청이는 몸 Look at my feet, look down 날 닮은 그림자 흔들리는 건 이놈인가 아니면 내 작은 발끝인가 두렵잖을 리 없잖아 다 괜찮을 리 없잖아 그래도 I know 서툴게 I flow 저 까만 바람과 함께 날아 Hey na na na 미치지 않으려면 미쳐야 해 Hey na na na 나를 다 던져 이 두 쪽 세상에 Hey na na na Can’t hold me down cuz you know I’m a fighter 제 발로 들어온 아름다운 감옥 Find me and I'm gonna live with ya (Eh-oh) 가져와 bring the pain oh yeah (Eh-oh) 올라타봐 bring the pain oh yeah Rain be pourin' Sky keep fallin' Everyday oh na na na (Eh-oh) 가져와 bring the pain oh yeah Bring the pain 모두 내 피와 살이 되겠지 Bring the pain No fear, 방법을 알겠으니 작은 것에 breathe 그건 어둠 속 내 산소와 빛 내가 나이게 하는 것들의 힘 넘어져도 다시 일어나 scream 넘어져도 다시 일어나 scream 언제나 우린 그랬으니 설령 내 무릎이 땅에 닿을지언정 파묻히지 않는 이상 그저 그런 해프닝쯤 될 거란 걸 Win no matter what Win no matter what Win no matter what 네가 뭐라던 누가 뭐라던 I don't give a uhh I don't give a uhh I don't give a uhh Hey na na na 미치지 않으려면 미쳐야 해 Hey na na na 나를 다 던져 이 두 쪽 세상에 Hey na na na Can’t hold me down cuz you know I’m a fighter 제 발로 들어온 아름다운 감옥 Find me and I'm gonna live with ya (Eh-oh) 가져와 bring the pain oh yeah (Eh-oh) 올라타봐 bring the pain oh yeah Rain be pourin' Sky keep fallin' Everyday oh na na na (Eh-oh) 가져와 bring the pain oh yeah 나의 고통이 있는 곳에 내가 숨 쉬게 하소서 My everythin’ My blood and tears Got no fears I'm singin’ ohhhhh Oh I’m takin’ over You should know yeah Can’t hold me down cuz you know I’m a fighter 깜깜한 심연 속 기꺼이 잠겨 Find me and I’m gonna bleed with ya (Eh-oh) 가져와 bring the pain oh yeah (Eh-oh) 올라타봐 bring the pain oh yeah Rain be pourin' Sky keep fallin' Everyday oh na na na (Eh-oh) Find me and I’m gonna bleed with ya (Eh-oh) 가져와 bring the pain oh yeah (Eh-oh) 올라타봐 bring the pain oh yeah All that I know is just goin’ on & on & on & on (Eh-oh) 가져와 bring the pain oh yeah",
        albumId: 4417123
    };

    try {
        const result1 = await insertAlbum(albumInfo);
        console.log(result1);
        const result2 = await insertTrack(trackInfo);
        console.log(result2);
    } catch(err) {
        console.error(err);
    }
}
