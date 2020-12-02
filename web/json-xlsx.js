const xlsx = require('xlsx');
const fs = require('fs');

/**
 * a file must has only one sheet
 * the first column must be english
 * @param xlsxPath
 * @param targetDir
 */
const xlsx2json = (xlsxPath, targetDir) => {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, {recursive: true});
    }

    fs.access(xlsxPath, (err) => {
        if (err) {
            return console.error(`${xlsxPath} error: file not exist`);
        }
        let workBook = xlsx.readFile(xlsxPath, {raw: true});
        if (!workBook) {
            console.error(`${xlsxPath} read error`);
            return
        }
        if (workBook.SheetNames === 0) {
            console.error(`${xlsxPath} error: no sheet`);
            return;
        }

        const sheet = workBook.Sheets[workBook.SheetNames[0]];
        let sheetJson = xlsx.utils.sheet_to_json(sheet, {header: 0});
        if (sheetJson.length <= 1) {
            console.error(`sheetJson is empty`);
            return;
        }
        const table = {};

        for (const data of sheetJson) {
            const enKey = data.en.trim();
            Object.keys(data).forEach((language) => {
                if (language in table) {
                    table[language][enKey] = data[language].trim();
                } else {
                    const translate = {};
                    translate[enKey] = data[language].trim();
                    table[language] = translate;
                }
            });
        }

        Object.keys(table).forEach(language => {
            fs.writeFileSync(`${targetDir}${language}.json`, JSON.stringify(table[language], null, 2));
        });
    });
};

const json2xlsx = (filePath, targetDir) => {
    fs.access(filePath, (err) => {
        if (err) {
            return console.log(`${filePath} error: file not exist`);
        }
        const language = filePath.slice(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
        const json = JSON.parse(fs.readFileSync(filePath));
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
        xlsx.writeFile(workBook, `${targetDir}${language}.xlsx`);
    });
};

module.exports = {xlsx2json, json2xlsx};
