const fs = require('fs');
const {copyDirectorySync, deleteDirectorySync} = require('./utils.js');

deleteDirectorySync("./build-web");
deleteDirectorySync("./build-server");
deleteDirectorySync("./static");

copyDirectorySync("../web/build-web", "./build-web");
copyDirectorySync("../server/src", "./build-server");
copyDirectorySync("../server/static", "./static");

copyDirectorySync("../server/CuraEngine/Config", "./CuraEngine/Config");
copyDirectorySync("../server/CuraEngine/2.7/macOS", "./CuraEngine/2.7/macOS");
fs.chmodSync("./CuraEngine/2.7/macOS/CuraEngine", 511);
