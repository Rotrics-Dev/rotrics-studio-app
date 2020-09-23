import TextToSVG from 'text-to-svg';
import textToSvgFromSvgFont from "../utils/textToSvgFromSvgFont";

//fetch doc: https://developer.mozilla.org/zh-CN/docs/Web/API/Response

//error交给调用者处理
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(window.serverAddress + '/uploadFile', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587458545878.jpg"}
    return response;
};

/**
 * 上传图片文件，返回url, width, height
 * 支持png, jpg, svg
 * error抛出，交给调用者处理
 * @param file
 * @returns {Promise<any>}
 */
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(window.serverAddress + '/uploadImage', {
        method: 'POST',
        body: formData
    }).then(response => {
        return response.json()
    });
    //response: {url: "http://localhost:3002/1587459128571.jpg", width: 500, height: 575}
    return response;
};

//options: https://github.com/shrhdk/text-to-svg
const text2svg = async (text, options) => {
    const response = await fetch(window.serverAddress + '/text2svg', {
        method: 'POST',
        body: JSON.stringify({text, options})
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587459128571.svg", width: 500, height: 575}
    return response;
};

const generateSvg = async (config_text) => {
    const {text, font, font_size} = config_text.children;
    let executor;
    const fontUrl = window.serverAddress + font.default_value;
    if (font.default_value.toLowerCase().endsWith('svg')) {
        executor = (resolve, reject) => {
            const options = {
                fontSize: font_size.default_value,
                tracking: 100, //字间距  1000/100
            }
            const svg = textToSvgFromSvgFont(fontUrl, text.default_value, options);
            resolve(svg);
        };
    } else {
        executor = (resolve, reject) => {
            TextToSVG.load(fontUrl, (err, textToSVG) => {
                const attributes = {fill: 'black', stroke: 'black'};
                const options = {
                    tracking: 100,
                    x: 0,
                    y: 0,
                    fontSize: font_size.default_value,
                    anchor: 'top',
                    attributes: attributes
                };
                const svg = textToSVG.getSVG(text.default_value, options);
                resolve(svg);
            });
        };
    }
    const promise = new Promise(executor);
    let svg = await promise;
    return svg;
};

const uploadFont = async (fontFile) => {
    const formData = new FormData();
    formData.append('file', fontFile);
    return await fetch(window.serverAddress + '/font/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
};

const deleteFont = async (font) => {
    const formData = new FormData();
    formData.append('font', font);
    return await fetch(window.serverAddress + '/font/delete', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
};

const listFonts = async () => {
    return await fetch(window.serverAddress + '/font/list', {
        method: 'POST'
    }).then(response => response.json());
};


export {uploadFile, uploadImage, text2svg, generateSvg, uploadFont, deleteFont, listFonts}


