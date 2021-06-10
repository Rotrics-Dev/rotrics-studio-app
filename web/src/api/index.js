import { join } from 'lodash';
import TextToSVG from 'text-to-svg';
import textToSvgFromSvgFont from "../utils/textToSvgFromSvgFont";

//fetch doc: https://developer.mozilla.org/zh-CN/docs/Web/API/Response

const getPath = (textToSVG, text, options) => new Promise((resolve) => {
    const path = textToSVG.getPath(text, options);
    resolve(path)
})

// 生成多行SVG
const getMultiLineSvg = async (textToSVG, texts, options) => {
    console.log('字号 ' + options.fontSize)
    const paths = []
    for (let i = 0; i < texts.length; i++) {
        const currentOptions = JSON.parse(JSON.stringify(options))
        currentOptions.y = i * options.fontSize
        const path = await getPath(textToSVG, texts[i], currentOptions)
        paths.push(path)
    }
    
    const lengths = texts.map((item) => item.length)
    const width = Math.max(...lengths) * options.fontSize
    const height = texts.length * options.fontSize
    console.log(width, height)
    const pathStr = paths.map((item) => item).join('')

    const start = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" \>`
    const end = '</svg>'
    const svg = start + pathStr + end;
    return svg;
}

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
    console.log('🔥 生成svg')
    // 文字
    const {text, font, font_size} = config_text.children;
    let executor;
    const fontUrl = window.serverAddress + font.default_value;

    console.log(text.default_value)

    // 文字值得
    const textValue = text.default_value

    // 文字长度
    const textLength = text.default_value.length

    // 字号
    const fontSize = font_size.default_value

    if (font.default_value.toLowerCase().endsWith('svg')) {
        executor = async (resolve, reject) => {
            const options = {
                fontSize: font_size.default_value,
                tracking: 100, //字间距  1000/100
            }

            const texts = text.default_value.split('\n')

            if (texts.length > 1) {
                const svgs = []
                for (let i = 0; i < texts.length; i++) {
                    const svg = await textToSvgFromSvgFont(fontUrl, texts[i] || '', options, i)
                    svgs.push(svg)
                }
                const svgStr = svgs.map((item) => item).join('')
                const lengths = texts.map((item) => item.length)
                const width = Math.max(...lengths) * options.fontSize
                const height = texts.length * options.fontSize
                const start = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" \>`
                const end = '</svg>'
                const svg = start + svgStr + end;
                // return svg;
                // const svg = await getMultiLineSvg(textToSVG, texts, options)
                resolve(svg);
            } else {
                const svg = textToSvgFromSvgFont(fontUrl, text.default_value || ' ', options);
                resolve(svg);
            }
        };
    } else {
        executor = async (resolve, reject) => {
            TextToSVG.load(fontUrl, async (err, textToSVG) => {
                const attributes = {fill: 'black', stroke: 'black'};
                const options = {
                    tracking: 100,
                    x: 0,
                    y: 0,
                    fontSize: font_size.default_value,
                    anchor: 'top',
                    attributes: attributes
                };
                const texts = text.default_value.split('\n')

                if (texts.length > 1) {
                    const svg = await getMultiLineSvg(textToSVG, texts, options)
                    // console.log(svg)
                    resolve(svg);
                } else {
                    const svg = textToSVG.getSVG(texts[0] || ' ', options);
                    resolve(svg);
                }
                
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


