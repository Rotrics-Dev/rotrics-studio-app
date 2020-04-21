const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const app = new Koa();
const router = new Router();
const serve = require('koa-static');

const {getImageSize, getUniqueFilename} = require('./utils');

const SERVER_PORT = 3002;
const UPLOAD_PATH = path.join(__dirname) + '/static/upload/';

const getFileUrl = (filename) => {
    return "http://localhost:" + SERVER_PORT + "/" + filename;
};

/**
 * @param file: ctx.request.files.file
 * @returns filename
 */
const saveFile = (file) => {
    const reader = fs.createReadStream(file.path);
    const filename = getUniqueFilename(file.name);
    let filePath = UPLOAD_PATH + filename;
    const upStream = fs.createWriteStream(filePath);
    reader.pipe(upStream);
    return filename;
};

const startHttpServer = () => {
    router.get('/test', (ctx, next) => {
        ctx.body = "test ok";
    });

//file: {"size":684,"path":"/var/folders/r6/w_gtq1gd0rbg6d6ry_h8t6wc0000gn/T/upload_bac2aa9af7e18da65c7535e1d44f4250","name":"cube_bin.stl","type":"application/octet-stream","mtime":"2020-04-17T04:21:17.843Z"}
    router.post('/uploadFile', async (ctx) => {
        // ctx.set('Access-Control-Allow-Origin', '*');
        const file = ctx.request.files.file;
        const filename = saveFile(file);
        const url = getFileUrl(filename);
        console.log("uploadfile ok: " + file.name + " -> " + url)
        return ctx.body = {url};
    });

    router.post('/uploadImage', async (ctx) => {
        // ctx.set('Access-Control-Allow-Origin', '*');
        const file = ctx.request.files.file;
        const filename = saveFile(file);
        const url = getFileUrl(filename);
        const {width, height} = getImageSize(file.path);
        console.log("uploadImage ok: " + file.name + " size: " + width + 'x' + height + " -> " + url);
        return ctx.body = {url, width, height};
    });

    app.use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        await next();
    });

    app.use(koaBody({multipart: true}));
    app.use(serve(UPLOAD_PATH));
    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(SERVER_PORT);

    console.log('start server success at port ' + SERVER_PORT);

    if (!fs.existsSync(UPLOAD_PATH)) {
        fs.mkdirSync(UPLOAD_PATH, {recursive: true});
    }

    if (fs.existsSync(UPLOAD_PATH)) {
        console.log("upload folder exist");
    } else {
        console.error("upload folder not exist");
    }
};

module.exports = startHttpServer;

