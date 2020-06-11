import fs from 'fs';
import path from 'path';
import http from "http";
import SocketIoServer from 'socket.io';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import serve from 'koa-static';
import isElectron from 'is-electron';
import {getImageSize, getUniqueFilename} from './utils/index.js';
import serialPortManager from './serialPortManager.js';
import generateToolPathLines from './toolPath/generateToolPathLines.js';
import gcodeSender from './gcode/gcodeSender.js';
import p3dStartSlice from './p3dStartSlice.js';
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
    TOOL_PATH_GENERATE_LASER,
    GCODE_UPDATE_SENDER_STATUS,
    GCODE_START_SEND,
    GCODE_STOP_SEND,
    GCODE_APPEND_SEND,
    P3D_MATERIAL_FETCH_ALL,
    P3D_MATERIAL_UPDATE,
    P3D_MATERIAL_DELETE,
    P3D_MATERIAL_CLONE,
    P3D_SETTING_FETCH_ALL,
    P3D_SETTING_UPDATE,
    P3D_SLICE_START,
    P3D_SLICE_STATUS
} from "./constants.js"

/**
 * 保存file到，静态文件夹下的cache
 * @param file: ctx.request.files.file
 * @returns url
 */
const saveFileToCacheDir = (file) => {
    const reader = fs.createReadStream(file.path);
    const filename = getUniqueFilename(file.name);
    let filePath = cache_dir + filename;
    const upStream = fs.createWriteStream(filePath);
    reader.pipe(upStream);
    const url = cache_base_url + filename;
    return url;
};

// const saveStringToFile = (str, extension) => {
//     const filename = getUniqueFilename("x" + extension); //x.svg
//     let filePath = upload_dir + filename;
//     fs.writeFileSync(filePath, str);
//     const url = "http://localhost:" + server_port + "/" + upload_name + "/" + filename;
//     return url;
// };

const __dirname = path.resolve();
const static_dir = path.join(__dirname) + '/static/';
const cache_dir = static_dir + "cache/";
let cache_base_url; //获取端口后，再初始化

//socket.io conjunction with koa: https://github.com/socketio/socket.io
let app = new Koa();
let router = new Router();
let httpServer = http.createServer(app.callback());
let socketIoServer = new SocketIoServer(httpServer);

const setupHttpServer = () => {
    router.get('/test', (ctx, next) => {
        ctx.body = "test ok";
    });

    //file: {"size":684,"path":"/var/folders/r6/w_gtq1gd0rbg6d6ry_h8t6wc0000gn/T/upload_bac2aa9af7e18da65c7535e1d44f4250","name":"cube_bin.stl","type":"application/octet-stream","mtime":"2020-04-17T04:21:17.843Z"}
    router.post('/uploadFile', async (ctx) => {
        console.log("uploadFile")
        // ctx.set('Access-Control-Allow-Origin', '*');
        const file = ctx.request.files.file;
        const url = saveFileToCacheDir(file);
        console.log("upload file ok: " + file.name + " -> " + url)
        return ctx.body = {url};
    });

    router.post('/uploadImage', async (ctx) => {
        // ctx.set('Access-Control-Allow-Origin', '*');
        const file = ctx.request.files.file;
        const url = saveFileToCacheDir(file);
        const {width, height} = getImageSize(file.path);
        console.log("upload image ok: " + file.name + " size: " + width + 'x' + height + " -> " + url);
        return ctx.body = {url, width, height};
    });

    app.use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        await next();
    });

    app.use(koaBody({multipart: true}));
    app.use(serve(static_dir));
    app.use(router.routes());
    app.use(router.allowedMethods());
};

// p3d material
// 以material_开头的文件
const readP3dMaterialsSync = () => {
    const dir = "./src/CuraEngine/Config/";
    const contents = [];
    const fileNames = fs.readdirSync(dir);
    fileNames.forEach((filename, index) => {
        if (filename.indexOf("material_") === 0) {
            const filePath = dir + filename;
            const content = fs.readFileSync(filePath, 'utf8');
            contents.push(JSON.parse(content))
        }
    });
    return contents;
};

const getP3dMaterialPath = (name) => {
    return `./src/CuraEngine/Config/material_${name}.def.json`;
};

// p3d setting
// 以setting_开头的文件
const readP3dSettingSync = () => {
    const dir = "./src/CuraEngine/Config/";
    const contents = [];
    const fileNames = fs.readdirSync(dir);
    fileNames.forEach((filename, index) => {
        if (filename.indexOf("setting_") !== -1) {
            const filePath = dir + filename;
            const content = fs.readFileSync(filePath, 'utf8');
            contents.push(JSON.parse(content))
        }
    });
    return contents;
};

const getP3dSettingPath = (name) => {
    return `./src/CuraEngine/Config/setting_${name}.def.json`;
};

const setupSocket = () => {
    socketIoServer.on(
        'connection',
        socket => {
            console.log('socket io server -> connect');

            socket.on('disconnect', () => {
                console.log('socket io server -> disconnect');
                //必须remove all，否则多次触发event，且内存泄漏
                socket.removeAllListeners();
                serialPortManager.removeAllListeners();
                gcodeSender.removeAllListeners();
            });

            //注意：最好都使用箭头函数，否则this可能指向其他对象
            //serial port
            socket.on(SERIAL_PORT_GET_PATH, () => serialPortManager.getPaths());
            socket.on(SERIAL_PORT_GET_OPENED, () => serialPortManager.getOpened());
            socket.on(SERIAL_PORT_OPEN, path => serialPortManager.open(path));
            socket.on(SERIAL_PORT_CLOSE, () => serialPortManager.close());
            socket.on(SERIAL_PORT_WRITE, data => serialPortManager.write(data));

            //gcode send
            socket.on(GCODE_START_SEND, (gcode) => gcodeSender.start(gcode));
            socket.on(GCODE_APPEND_SEND, (gcode) => gcodeSender.append(gcode));
            socket.on(GCODE_STOP_SEND, () => gcodeSender.stop());
            socket.on(GCODE_UPDATE_SENDER_STATUS, () => {
                socket.emit(GCODE_UPDATE_SENDER_STATUS, gcodeSender.getStatus());
            });

            //gcode generate
            socket.on(
                TOOL_PATH_GENERATE_LASER,
                async (data) => {
                    console.log(TOOL_PATH_GENERATE_LASER)
                    const {url, settings, toolPathId, fileType} = data;
                    const toolPathLines = await generateToolPathLines(fileType, url, settings);
                    socket.emit(TOOL_PATH_GENERATE_LASER, {toolPathLines, toolPathId});
                }
            );

            // p3d material
            socket.on(P3D_MATERIAL_FETCH_ALL, () => {
                const materials = readP3dMaterialsSync();
                socket.emit(P3D_MATERIAL_FETCH_ALL, materials);
            });
            socket.on(P3D_MATERIAL_UPDATE, (data) => {
                //为了方便，文件名和name对应
                const {name, key, value} = data;
                //读出来
                const filePath = getP3dMaterialPath(name);
                const material = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const keys = key.split('.');
                switch (keys.length) {
                    case 1:
                        material[keys[0]] = value;
                        break;
                    case 3:
                        material[keys[0]][keys[1]][keys[2]] = value;
                        break;
                }
                //写回去
                fs.writeFileSync(filePath, JSON.stringify(material, null, 2));
                //全部读出来
                const materials = readP3dMaterialsSync();
                socket.emit(P3D_MATERIAL_FETCH_ALL, materials);
            });

            // p3d setting
            socket.on(P3D_SETTING_FETCH_ALL, () => {
                const settings = readP3dSettingSync();
                socket.emit(P3D_SETTING_FETCH_ALL, settings);
            });
            socket.on(P3D_SETTING_UPDATE, (data) => {
                //为了方便，文件名和name对应
                const {name, key, value} = data;
                //读出来
                const filePath = getP3dSettingPath(name);
                const setting = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const keys = key.split('.');
                switch (keys.length) {
                    case 1:
                        setting[keys[0]] = value;
                        break;
                    case 3:
                        setting[keys[0]][keys[1]][keys[2]] = value;
                        break;
                }
                //写回去
                fs.writeFileSync(filePath, JSON.stringify(setting, null, 2));
                //全部读出来
                const settings = readP3dSettingSync();
                socket.emit(P3D_SETTING_FETCH_ALL, settings);
            });

            // p3d slice
            socket.on(P3D_SLICE_START, (data) => {
                //data: {stlUrl, materialName, settingName, id}
                const {id} = data;
                p3dStartSlice(
                    data,
                    (progress) => {
                        socket.emit(P3D_SLICE_STATUS, {progress, id});
                    },
                    (result) => {
                        socket.emit(P3D_SLICE_STATUS, {result, id});
                    },
                    (err) => {
                        socket.emit(P3D_SLICE_STATUS, {err, id});
                    }
                );
            });

            serialPortManager.on(SERIAL_PORT_GET_PATH, (paths) => {
                socket.emit(SERIAL_PORT_GET_PATH, paths);
            });
            serialPortManager.on(SERIAL_PORT_GET_OPENED, (path) => {
                console.log(SERIAL_PORT_GET_OPENED + " -> " + path)
                socket.emit(SERIAL_PORT_GET_OPENED, path);
            });
            serialPortManager.on(SERIAL_PORT_OPEN, (path) => {
                socket.emit(SERIAL_PORT_OPEN, path);
            });
            serialPortManager.on(SERIAL_PORT_CLOSE, (path) => {
                socket.emit(SERIAL_PORT_CLOSE, path);
            });
            serialPortManager.on(SERIAL_PORT_ERROR, (error) => {
                socket.emit(SERIAL_PORT_ERROR, error);
            });
            serialPortManager.on(SERIAL_PORT_DATA, (data) => {
                socket.emit(SERIAL_PORT_DATA, data);
                gcodeSender.onSerialPortData(data)
            });

            gcodeSender.on(GCODE_UPDATE_SENDER_STATUS, (status) => {
                socket.emit(GCODE_UPDATE_SENDER_STATUS, status);
            });
        }
    );
};

const startListen = () => {
    console.log("=============================================")

    const electron = isElectron();
    console.log("is electron: " + electron);

    if (!fs.existsSync(cache_dir)) {
        fs.mkdirSync(cache_dir, {recursive: true});
    }

    const cache_dir_exist = fs.existsSync(cache_dir);
    console.log("cache dir exist: " + cache_dir_exist);

    if (electron) {
        httpServer.on('listening', () => {
            //http://nodejs.cn/api/net.html#net_class_net_server
            const {port, address} = httpServer.address();
            const serverIp = `http://localhost:${port}`;
            window.serverIp = serverIp;
            cache_base_url = `${serverIp}/cache/`;
            console.log('start server at: ' + serverIp);
            console.log('cache_base_url: ' + cache_base_url);
            console.log("=============================================")
        });
        httpServer.listen(0);
    } else {
        const port = 9000;
        httpServer.listen(port);
        cache_base_url = `http://localhost:${port}/cache/`;
        console.log('start server at: ' + `http://localhost:${port}`);
        console.log('cache_base_url: ' + cache_base_url);
        console.log("=============================================")
    }
};

//electron环境下: 动态获取可用端口
//dev环境下：http://localhost:9000
const startServer = () => {
    setupHttpServer();
    setupSocket();
    startListen();
};

export default startServer;
