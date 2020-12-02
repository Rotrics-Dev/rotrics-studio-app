const fs = require("fs");
const jsonXlsx = require("./json-xlsx");

fs.rmdirSync("./build-web/asset/i18n", {recursive: true});
jsonXlsx.xlsx2json("./i18n.xlsx", "./build-web/asset/i18n/common/");
