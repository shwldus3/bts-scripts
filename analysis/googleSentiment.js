const bts_datasource = require('../data/query');
const language = require('@google-cloud/language');
const fs = require('fs');

// Creates a client
const client = new language.LanguageServiceClient({ keyFilename: '/Users/jiyeon.noh/Workspace/project-jsconf/bts_scripts/BTS-Project-c43e5ba0009e.json' });

const analyzeSentiment = async (sentences) => {
    // Prepares a document, representing the provided text
    const document = {
        content: sentences,
        // language: 'ko',
        type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the document
    const [result] = await client.analyzeSentiment({ document, encodingType: 'UTF8' });
    return result
};

const writeFile = (data, fileName) => {
    const filePath = `${__dirname}/${fileName}`;

    try {
        fs.writeFileSync(filePath, data);
    } catch (err) {
        throw err;
    }
}

const _runTest = async () => {
    try {
        const data = await bts_datasource.selectLyrics();
        const result = [];
        for (const d of data) {
            const koreanStr = d.korean_lyric;
            const englishStr = d.english_lyric;
            const trackId = d.track_id;
            const korean = koreanStr.split('\n').reduce((prev, cur) => {
                console.log(cur.replace(' ', ''));
                if (!cur.replace(' ', '')) return prev;
                prev += cur + '. ';
                return prev;
            }, '');
            const english = englishStr.split('\n').reduce((prev, cur) => {
                if (!cur) return prev;
                prev += cur + '. ';
                return prev;
            }, '');
            console.log(korean);
            // const s1 = await analyzeSentiment(korean);
            // const s2 = await analyzeSentiment(english);
            // result.push(s1);
            // result.push(s2);
        }
        // writeFile(JSON.stringify(result), 'lyricSentiment.json');
    } catch (e) {
        console.error(e)
    }
}



_runTest();