from khaiii import KhaiiiApi
import psycopg2
import json
import re

api = KhaiiiApi(rsc_dir='/Users/jiyeon.noh/Workspace/project-jsconf/khaiii/build/share/khaiii') # 빌드 경로

conn = psycopg2.connect(
    host = "localhost",
    database = "bts",
    user = "admin",
    password = "admin"
)

def getTrackLyrics(id):
    cur = conn.cursor()
    cur.execute("SELECT track_id, lyric, type FROM track as t, album as a where t.type = 'N' AND t.lyric IS NOT NULL AND t.album_id = a.album_id and a.artist_id = %s", (id,))
    results = cur.fetchall()
    cur.close()
    return results

def saveLyricMorphs(word, type, track_id):
    cur = conn.cursor()
    cur.execute("INSERT INTO lyric_morpheme (lyric_word, type, track_id) VALUES(%s, %s, %s)", (word, type, track_id))
    conn.commit()
    cur.close()

def analyzeSentence(sentence):
    morphs = []

    for word in api.analyze(sentence):
        for morph in word.morphs:
            morphs.append((morph.lex, morph.tag))

    return morphs

def transformSentence(sentence):
    result = sentence.replace('\n', '')
    result = result.replace('\r', '')
    result = re.sub('/[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+[々〆〤]+/u', '', result)
    return result

def _runWordAnalysis():
    trackLyrics = getTrackLyrics(272211)
    print(str(len(trackLyrics)) + ' 가사 형태소 분석 및 저장 시작')
    for el in trackLyrics:
        morphs = analyzeSentence(el[1])
        for m in morphs:
            saveLyricMorphs(m[0], m[1], el[0])

    print('완료')


_runWordAnalysis()

conn.close()