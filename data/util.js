'use strict';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs')

exports.classifyType = (type) => {
    if (type === 'N') {
        return '신곡';
    } else if (type === 'E') {
        return '풀 버전';
    } else if (type === 'F') {
        return '피쳐링';
    } else if (type === 'J') {
        return '다른 버전';
    } else if (type === 'M') {
        return '리믹스';
    } else {
        return '중복'
    }
}
exports.writeCsv = async (data, columns, csvFileName, key) => {
    try {
        const header = [];
        columns.map(key => {
            header.push({
                id: key, title: key
            })
        });
        const filePath = `${__dirname}/csv/${key}/${csvFileName}.csv`;
        const csvWriter = createCsvWriter({
            path: filePath,
            header
        });
        await csvWriter.writeRecords(data);
    } catch (err) {
        throw new Error(err);
    }
};

exports.writeFile = (data, key, fileName) => {
    const filePath = `${__dirname}/${fileName.includes('.json') ? 'json' : 'result'}/${key}/${fileName}`;

    try {
        fs.writeFileSync(filePath, data);
    } catch (err) {
        throw err;
    }
};
