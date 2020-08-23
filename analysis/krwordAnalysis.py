from krwordrank.word import KRWordRank
from krwordrank.hangle import normalize
import krwordrank
import psycopg2
import sys

sys.path.append('../')
    
conn = psycopg2.connect(
    host = "localhost",
    database = "bts",
    user = "admin",
    password = "admin"
)
def getLyrics(id):
    cur = conn.cursor()
    cur.execute("SELECT a.artist_id, string_agg(lyric, ' ') FROM track as t, album as a where t.type = 'N' AND t.lyric IS NOT NULL AND t.album_id = a.album_id and a.artist_id = %s group by 1", (id,))
    results = cur.fetchall()
    cur.close()
    return results

def getAlbumLyrics(id):
    cur = conn.cursor()
    cur.execute("SELECT a.album_id, string_agg(lyric, ' ') FROM track as t, album as a where t.type = 'N' AND t.lyric IS NOT NULL AND t.album_id = a.album_id and a.artist_id = %s group by 1", (id,))
    results = cur.fetchall()
    cur.close()
    return results

def keyword_normalize(lyricData):
    lyrics = []

    for data in lyricData:
        texts = []
        lyric = data[1].split('\n')

        for l in lyric:
            if not bool(l.strip()):
                continue
            texts.append(normalize(l))

        texts = list(filter(lambda v: v and v != '중국어 병음', texts))
        lyrics.append({ 'album_id': data[0], 'lyric': texts })

    return lyrics

def keyword_extract(lyrics):
    for l in lyrics:
        if len(l['lyric']) < 10:
            print(l['lyric'])
            continue
        # print(l['track_id'])

        wordrank_extractor = KRWordRank(
            min_count = 5, # 단어의 최소 출현 빈도수 (그래프 생성 시)
            max_length = 10, # 단어의 최대 길이
            verbose = True
        )

        beta = 0.85    # PageRank의 decaying factor beta
        max_iter = 10

        keywords, rank, graph = wordrank_extractor.extract(l['lyric'], beta, max_iter)
        l['keywords'] = keywords

    return lyrics


def saveLyricKeyword(keyword, score, album_id, artist_id):
    cur = conn.cursor()
    cur.execute("INSERT INTO lyric_keyword (keyword, score, album_id, artist_id, type) VALUES(%s, %s, %s, %s, %s)", (keyword, score, album_id, artist_id, 'A'))
    conn.commit()
    cur.close()

def saveLyricTopNKeyword(keyword, score, artist_id):
    cur = conn.cursor()
    cur.execute("INSERT INTO lyric_keyword (keyword, score, artist_id, type) VALUES(%s, %s, %s, %s)", (keyword, score, artist_id, 'T'))
    conn.commit()
    cur.close()

def _runWordAnalysis():
    # exo 272211
    # got7 314487
    # bts 143179
    artistId = 143179
    lyricData = getLyrics(artistId)
    # lyricData = getAlbumLyrics(artistId)
    normalizedLyric = keyword_normalize(lyricData)
    results = keyword_extract(normalizedLyric)

    # for r in results:
    #     if 'keywords' in r:
    #         print(r['keywords'])
    #         break
    print('keyword extractor done!')

    for r in results:
        if 'keywords' in r: 
            keywords = r['keywords']

            for k in keywords:
                # saveLyricKeyword(k, keywords[k], r['album_id'], str(artistId))
                saveLyricTopNKeyword(k, keywords[k], str(artistId))

    print('keyword save done!')



_runWordAnalysis()

conn.close()