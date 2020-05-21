import TextToSVG from 'text-to-svg';

//fetch doc: https://developer.mozilla.org/zh-CN/docs/Web/API/Response

//error交给调用者处理
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:3002/uploadFile', {
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
    const response = await fetch('http://localhost:3002/uploadImage', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587459128571.jpg", width: 500, height: 575}
    return response;
};

//options: https://github.com/shrhdk/text-to-svg
const text2svg = async (text, options) => {
    const response = await fetch('http://localhost:3002/text2svg', {
        method: 'POST',
        body: JSON.stringify({text, options})
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587459128571.svg", width: 500, height: 575}
    return response;
};

const generateSvg = async (config_text) => {
    const {text, font, font_size} = config_text.children;
    const fontUrl = "http://localhost:3002/fonts/" + font.default_value;
    let promise = new Promise((resolve, reject) => {
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
    });

    let svg = await promise;
    return svg;
};

export {uploadFile, uploadImage, text2svg, generateSvg}


