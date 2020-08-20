from soynlp.noun import LRNounExtractor_v2
import psycopg2
import json
import re

def getTrackLyrics():
    conn = psycopg2.connect(
        host = "localhost",
        database = "bts",
        user = "admin",
        password = "admin"
    )

    cur = conn.cursor()
    cur.execute("select track_id, lyric from track where type = 'N' and lyric is not null")
    results = cur.fetchall()
    cur.close()
    conn.close()
    return results

def analyzeSentence(sentences):
    noun_extractor = LRNounExtractor_v2(verbose=True)
    nouns = noun_extractor.train_extract(sentences)
    return nouns

def transformSentence(sentence):
    result = sentence.replace('\n', '')
    result = result.replace('\r', '')
    result = re.sub('/[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+[々〆〤]+/u', '', result)
    return result

def _runWordAnalysis():

    trackLyrics = getTrackLyrics()
    sentences = []
    for el in trackLyrics:
        sentences.append(transformSentence(el[1]))

    nouns = analyzeSentence(sentences)

    data = json.dumps(nouns, ensure_ascii = False)
    f = open("keywords.json", 'w')
    f.write(data)
    f.close()


_runWordAnalysis()


