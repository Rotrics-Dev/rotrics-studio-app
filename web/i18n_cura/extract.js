const fs = require('fs');

//从filePathIn读取，写入到filePathOutput
const extract = (filePathIn, filePathOutput) => {
    const jsObj = {};
    const content = fs.readFileSync(filePathIn, 'utf8');
    const arr = content.split("\n#: fdmprinter.def.json");
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i].trim();
        const contents = item.split("\n");
        if (contents.length === 3) {
            const line0 = contents[0].trim();
            const line1 = contents[1].trim();
            const line2 = contents[2].trim();
            if (line0.indexOf("msgctxt ") === 0 &&
                line1.indexOf("msgid ") === 0 &&
                line2.indexOf("msgstr ") === 0
            ) {
                const msgctxt = line0.replace("msgctxt", "").replace(/\"/g, "").trim();
                const msgid = line1.replace("msgid", "").replace(/\"/g, "").trim();
                const msgstr = line2.replace("msgstr", "").replace(/\"/g, "").trim();
                if (msgstr.length === 0) {
                    jsObj[msgid] = msgid;
                } else {
                    jsObj[msgid] = msgstr;
                }
            }
        }
    }
    fs.writeFileSync(filePathOutput, JSON.stringify(jsObj, null, 2));
};

const extract_i18n_cura = () => {
    //从i18n_cura目录中，抽取需要的翻译字段
    //并写到/build-web/asset/i18n/cura/中
    const dirIn = "./i18n_cura/";
    const dirOutput = "./build-web/asset/i18n/cura/";
    const fdmJsonFilename = "fdmprinter.def.json.po";

    fs.mkdirSync(dirOutput, {recursive: true});

    const fileNames = fs.readdirSync(dirIn);
    const subDirNames = []; //i18n_cura下文件夹名字
    fileNames.forEach((filename) => {
        const stats = fs.statSync(`${dirIn}${filename}`);
        if (stats.isDirectory()) {
            subDirNames.push(filename)
        }
    });

    subDirNames.forEach((subDirName) => {
        const filePathIn = `${dirIn}${subDirName}/${fdmJsonFilename}`;
        //下划线变中线
        const filePathOut = `${dirOutput}${subDirName.replace("_", "-")}.json`;
        extract(filePathIn, filePathOut);
    });

    //english
    const filePathIn4en = `${dirIn}fdmprinter.def.json.pot`;
    const filePathOutput4en = `${dirOutput}en.json`;

    extract(filePathIn4en, filePathOutput4en);
};

module.exports = extract_i18n_cura;






