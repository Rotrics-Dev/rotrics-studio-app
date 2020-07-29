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
            // console.log("Item Is Directory:" + item);
            copyDirectorySync(item_path, path.join(dest, item));
        }
    });
};

const deleteDirectorySync = (dir) => {
    if (fs.existsSync(dir) == true) {
        var files = fs.readdirSync(dir);
        files.forEach(function (item) {
            var item_path = path.join(dir, item);
            // console.log(item_path);
            if (fs.statSync(item_path).isDirectory()) {
                deleteDirectorySync(item_path);
            } else {
                fs.unlinkSync(item_path);
            }
        });
        fs.rmdirSync(dir);
    }
};

module.exports = {copyDirectorySync, deleteDirectorySync};



