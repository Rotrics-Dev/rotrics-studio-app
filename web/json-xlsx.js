const xlsx = require('xlsx');
const fs = require('fs');
const fileDir = './build-web/asset/i18n/common/';

/**
 * 运行方式(1) npm run json-xlsx <xxx.json> Json转Xlsx
 * 运行方式(2) npm run json-xlsx <xxx.xlsx> Xlsx转Json
 * 生成结果会生成在/build-web/asset/i18n/common目录
 * 可以一次处理多个文件
 */

/**
 * 一个文件只能有一个表格
 * 一个表格只能有两列
 * 第一列为英语
 * 第二列为目标语言
 */
function xlsx2Json(fileName) {
    const path = `${fileDir}${fileName}`;

    fs.access(path, (err) => {
        console.log(`当前处理文件:${fileName}`)
        if (err) {
            return console.log(`${fileName} 不存在`);
        }
        let workBook = xlsx.readFile(path, {raw: true});
        if (!workBook) {
            console.log(`${fileName} 读取错误`)
            return
        }
        if (workBook.SheetNames === 0) {
            console.log(`${fileName} 不含表格`)
            return;
        }

        const sheet = workBook.Sheets[workBook.SheetNames[0]]//读取工作表
        let sheetJson = xlsx.utils.sheet_to_json(sheet, {header: 0});
        if (sheetJson.length <= 1) {
            console.log(`${sheetName} is empty`);
            return;
        }
        const table = {}

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
}

async function jsonToXlsx(fileName) {
    const path = `${fileDir}${fileName}`;
    fs.access(path, (err) => {
        console.log(`当前处理文件:${fileName}`)
        if (err) {
            return console.log(`${fileName} 不存在`);
        }
        const language = fileName.slice(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.'));
        const json = JSON.parse(fs.readFileSync(path))
        const languageArray = [];
        Object.keys(json).forEach(
            (key) => {
                const translate = {};
                translate['en'] = key;
                translate[language] = json[key];
                languageArray.push(translate)
            }
        )
        const workSheet = xlsx.utils.json_to_sheet(languageArray);
        const workBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workBook, workSheet, "Sheet1");
        console.log(`当前处理结果:${fileDir}${language}.xlsx`)
        xlsx.writeFile(workBook, `${fileDir}${language}.xlsx`);
    });
}

const argv = process.argv;
if (argv.length <= 2) {
    console.log('请指定.json或者.xlsx文件')
    return;
}
const paths = argv.slice(2, argv.length);


for (const path of paths) {
    if (path.toLowerCase().endsWith('.xlsx')) {
        xlsx2Json(path);
    } else if (path.toLowerCase().endsWith('.json')) {
        jsonToXlsx(path);
    }
}