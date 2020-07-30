const xlsx = require('xlsx');
const fs = require('fs');

/**
 * 一个文件只能有一个表格
 * 一个表格只能有两列
 * 第一列为英语
 * 第二列为目标语言
 */
const xlsx2json = (filePath) => {
    fs.access(filePath, (err) => {
        console.log(`当前处理文件:${filePath}`)
        if (err) {
            return console.log(`${filePath} 不存在`);
        }
        let workBook = xlsx.readFile(filePath, {raw: true});
        if (!workBook) {
            console.log(`${filePath} 读取错误`)
            return
        }
        if (workBook.SheetNames === 0) {
            console.log(`${filePath} 不含表格`)
            return;
        }

        const sheet = workBook.Sheets[workBook.SheetNames[0]];//读取工作表
        let sheetJson = xlsx.utils.sheet_to_json(sheet, {header: 0});
        if (sheetJson.length <= 1) {
            console.log(`sheetJson is empty`);
            return;
        }
        const table = {};

        for (const data of sheetJson) {
            const enKey = data.en;
            Object.keys(data).forEach((language) => {
                if (language in table) {
                    table[language][enKey] = data[language];
                } else {
                    const translate = {};
                    translate[enKey] = data[language];
                    table[language] = translate;
                }
            });
        }

        Object.keys(table).forEach(language => {
            console.log(`当前处理结果:${fileDir}${language}.json`)
            fs.writeFileSync(`${fileDir}${language}.json`, JSON.stringify(table[language], null, 2));
        });
    });
};

const json2xlsx = (filePath) => {
    fs.access(filePath, (err) => {
        console.log(`当前处理文件:${filePath}`)
        if (err) {
            return console.log(`${filePath} 不存在`);
        }
        const language = filePath.slice(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
        const json = JSON.parse(fs.readFileSync(filePath))
        const languageArray = [];
        Object.keys(json).forEach(
            (key) => {
                const translate = {};
                translate['en'] = key;
                translate[language] = json[key];
                languageArray.push(translate)
            }
        );
        const workSheet = xlsx.utils.json_to_sheet(languageArray);
        const workBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workBook, workSheet, "Sheet1");
        console.log(`当前处理结果:${fileDir}${language}.xlsx`)
        xlsx.writeFile(workBook, `${fileDir}${language}.xlsx`);
    });
};

module.exports = {xlsx2json, json2xlsx};
