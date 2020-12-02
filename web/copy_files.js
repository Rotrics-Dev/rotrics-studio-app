const fs = require('fs');
const path = require('path');

const copyDirectorySync = (src, dest) => {
    if (!fs.existsSync(src)) {
        return false;
    }
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, {recursive: true});
    }
    var dirs = fs.readdirSync(src);
    dirs.forEach(function (item) {
        var item_path = path.join(src, item);
        var temp = fs.statSync(item_path);
        if (temp.isFile()) {
            fs.copyFileSync(item_path, path.join(dest, item));
        } else if (temp.isDirectory()) {
            copyDirectorySync(item_path, path.join(dest, item));
        }
    });
};

fs.rmdirSync("./build-web", {recursive: true});
fs.mkdirSync("./build-web");
fs.copyFileSync("./index.html", "./build-web/index.html");
copyDirectorySync("../../rotrics-scratch-blocks/media", "./build-web/asset/rotrics-scratch-blocks/media/");

