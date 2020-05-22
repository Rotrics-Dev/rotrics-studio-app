import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import serve from 'koa-static';

import {getImageSize, getUniqueFilename} from './utils.js';

const app = new Koa();
const router = new Router();

const server_port = 3002;

let __dirname = path.resolve();
const static_dir = path.join(__dirname) + '/server/static/';
const cache_dir = static_dir + "cache/"
const cache_base_url = "http://localhost:" + server_port + "/cache/";

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

const startHttpServer = () => {
    router.get('/test', (ctx, next) => {
        ctx.body = "test ok";
    });

    //file: {"size":684,"path":"/var/folders/r6/w_gtq1gd0rbg6d6ry_h8t6wc0000gn/T/upload_bac2aa9af7e18da65c7535e1d44f4250","name":"cube_bin.stl","type":"application/octet-stream","mtime":"2020-04-17T04:21:17.843Z"}
    router.post('/uploadFile', async (ctx) => {
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

    app.listen(server_port);

    if (!fs.existsSync(cache_dir)) {
        fs.mkdirSync(cache_dir, {recursive: true});
    }

    if (fs.existsSync(cache_dir)) {
        console.log("cache_dir exist");
    } else {
        console.error("cache_dir not exist");
    }

    console.log('start server at port ' + server_port);
};

export default startHttpServer;

