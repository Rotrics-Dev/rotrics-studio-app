const fs = require('fs');
const path = require('path');

function CopyDirectory(src, dest) {
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
            // console.log("Item Is Directory:" + item);
            CopyDirectory(item_path, path.join(dest, item));
        }
    });
}

function DeleteDirectory(dir) {
    if (fs.existsSync(dir) == true) {
        var files = fs.readdirSync(dir);
        files.forEach(function (item) {
            var item_path = path.join(dir, item);
            // console.log(item_path);
            if (fs.statSync(item_path).isDirectory()) {
                DeleteDirectory(item_path);
            } else {
                fs.unlinkSync(item_path);
            }
        });
        fs.rmdirSync(dir);
    }
}

//1. 删除文件夹：build-server，build-web，CuraEngine
//2. 从目标目录，复制文件夹：build-server，build-web，CuraEngine
DeleteDirectory("./build-server");
DeleteDirectory("./CuraEngine");
DeleteDirectory("./build-web");

CopyDirectory("../server/src", "./build-server");
CopyDirectory("../server/CuraEngine", "./CuraEngine");
CopyDirectory("../web/build-web", "./build-web");

//https://stackoverflow.com/questions/20769023/using-nodejs-chmod-777-and-0777
fs.chmodSync("./CuraEngine/2.7/Linux-x64/CuraEngine", 511);
fs.chmodSync("./CuraEngine/2.7/macOS/CuraEngine", 511);
fs.chmodSync("./CuraEngine/2.7/Win-x64/CuraEngine.exe", 511);
