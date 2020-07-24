const fs = require('fs');

const filePathIn = "./build-web/asset/i18n/common/zh-CN.json";
const filePathOut = "./build-web/asset/i18n/common/en.json";

const contentIn = fs.readFileSync(filePathIn, 'utf8');
const ObjIn = JSON.parse(contentIn);

const objOut = {};
Object.keys(ObjIn).forEach((key) => {
    objOut[key] = key;
});

fs.writeFileSync(filePathOut, JSON.stringify(objOut, null, 2));
