const fs = require('fs');
const {copyDirectorySync, deleteDirectorySync} = require('./utils.js');

deleteDirectorySync("./build-web");
deleteDirectorySync("./build-server");
deleteDirectorySync("./static");
deleteDirectorySync("./CuraEngine");

copyDirectorySync("../web/build-web", "./build-web");
copyDirectorySync("../server/build-server", "./build-server");
copyDirectorySync("../server/static/fonts", "./static/fonts");

copyDirectorySync("../server/CuraEngine/Config", "./CuraEngine/Config");
copyDirectorySync("../server/CuraEngine/2.7/Win-x64", "./CuraEngine/2.7/Win-x64");

fs.chmodSync("./CuraEngine/2.7/Win-x64/CuraEngine.exe", 511);
