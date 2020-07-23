const fs = require('fs');

const delDir = (dirPath) => {
    let files = [];
    if(fs.existsSync(dirPath)){
        files = fs.readdirSync(dirPath);
        files.forEach((file, index) => {
            let curPath = dirPath + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(dirPath);
    }
};

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
const copyDir = (src, dist, callback) => {
    fs.access(dist, (err) => {
        if(err){
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });

    const _copy = (err, src, dist) => {
        if(err){
            callback(err);
        } else {
            fs.readdir(src, function(err, paths) {
                if(err){
                    callback(err)
                } else {
                    paths.forEach(function(path) {
                        var _src = src + '/' +path;
                        var _dist = dist + '/' +path;
                        fs.stat(_src, function(err, stat) {
                            if(err){
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if(stat.isFile()) {
                                    fs.writeFileSync(_dist, fs.readFileSync(_src));
                                } else if(stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }
};

//1. 删除文件夹：build-server，build-web，CuraEngine
//2. 从目标目录，复制文件夹：build-server，build-web，CuraEngine
delDir("./build-server");
delDir("./build-web");
delDir("./CuraEngine");

fs.mkdirSync("./build-server");
fs.mkdirSync("./build-web");
fs.mkdirSync("./CuraEngine");

copyDir("../server/src", "./build-server")
copyDir("../web/build-web", "./build-web")
copyDir("../server/CuraEngine", "./CuraEngine")
