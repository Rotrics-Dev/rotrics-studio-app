import path from 'path' ;
import sizeOf from 'image-size';
import TextToSVG from 'text-to-svg';

/**
 * 支持svg, jpg, png, bmp等多种文件格式
 * doc: https://github.com/image-size/image-size#readme
 * @param imagePath
 * @returns {{width: *, height: *}}
 */
const getImageSize = (imagePath) => {
    const dimensions = sizeOf(imagePath);
    return {
        width: dimensions.width,
        height: dimensions.height
    }
};

const getUniqueFilename = (filename) => {
    return Date.now() + path.extname(filename);
};

//将utf-8编码的字节数组，转为utf-8编码的字符串
//https://www.yuque.com/qkd6oi/ztk6hz/vmnai3
const utf8bytes2string = (bytes) => {
    /**
     * 初始化字节流,把-128至128的区间改为0-256的区间.便于计算
     * @param {Array} array 字节流数组
     * @return {Array} 转化好的字节流数组
     */
    const _init = (array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] &= 0xff;
        }
        return array;
    };

    if (typeof bytes === 'string') {
        return bytes;
    }

    let str = '', _arr = _init(bytes);
    for (let i = 0; i < _arr.length; i++) {
        let one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            let bytesLength = v[0].length;
            let store = _arr[i].toString(2).slice(7 - bytesLength);
            for (let st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
};

//options: https://github.com/shrhdk/text-to-svg
const text2svg = (text, options = {}) => {
    const textToSVG = TextToSVG.loadSync(); //使用默认字体
    const svg = textToSVG.getSVG(text, options);

    const {width, height} = textToSVG.getMetrics(text, options);
    return {svg, width, height}
};

export {getImageSize, getUniqueFilename, utf8bytes2string, text2svg};
