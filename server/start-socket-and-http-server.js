import fs from 'fs';
import path from 'path';
import http from "http";
import SocketIoServer from 'socket.io';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import serve from 'koa-static';
import {getImageSize, getUniqueFilename} from './utils.js';
import serialPortManager from './serialPortManager.js';
import generateToolPathLines from './toolPath/generateToolPathLines.js';
import gcodeSender from './gcode/gcodeSender.js';
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
    TOOL_PATH_GENERATE_LASER,
    GCODE_STATUS,
    GCODE_SEND_START,
    GCODE_SEND_STOP,
} from "../shared/constants.js"

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

const port = 3002;

const __dirname = path.resolve();
const static_dir = path.join(__dirname) + '/server/static/';
const cache_dir = static_dir + "cache/";
const cache_base_url = "http://localhost:" + port + "/cache/";

//socket.io conjunction with koa: https://github.com/socketio/socket.io
let app = new Koa();
let router = new Router();
let httpServer = http.createServer(app.callback());
let socketIoServer = new SocketIoServer(httpServer);

const startHttpServer = () => {
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

    // app.listen(server_port);

    if (!fs.existsSync(cache_dir)) {
        fs.mkdirSync(cache_dir, {recursive: true});
    }

    if (fs.existsSync(cache_dir)) {
        console.log("cache_dir exist");
    } else {
        console.error("cache_dir not exist");
    }

    httpServer.listen(port);
    console.log('start server at port ' + port);
};

const startSocket = () => {
    socketIoServer.on(
        'connection',
        socket => {
            console.log('socket io server -> connect');

            socket.on('disconnect', () => {
                console.log('socket io server -> disconnect');
                //必须remove all，否则多次触发event，且内存泄漏
                socket.removeAllListeners();
                serialPortManager.removeAllListeners();
            });

            //注意：最好都使用箭头函数，否则this可能指向其他对象
            //serial port
            socket.on(SERIAL_PORT_GET_PATH, () => serialPortManager.getPaths());
            socket.on(SERIAL_PORT_GET_OPENED, () => serialPortManager.getOpened());
            socket.on(SERIAL_PORT_OPEN, path => serialPortManager.open(path));
            socket.on(SERIAL_PORT_CLOSE, () => serialPortManager.close());
            socket.on(SERIAL_PORT_WRITE, str => serialPortManager.write(str));

            //gcode send
            socket.on(GCODE_SEND_START, (gcode) => gcodeSender.start(gcode));
            socket.on(GCODE_SEND_STOP, () => gcodeSender.stop());
            socket.on(GCODE_STATUS, () => {
                const status = gcodeSender.getStatus();
                socket.emit(GCODE_STATUS, status);
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
        }
    );
    console.log('start socket io server at port ' + port);
};

const startBoth = () => {
    console.log("======================================")
    startHttpServer();
    startSocket();
    console.log("======================================")
};

export default startBoth;
