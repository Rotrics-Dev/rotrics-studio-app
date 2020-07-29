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

const string2utf8bytes = (str) => {
    const utf8bytes = [];
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode < 0x80) utf8bytes.push(charCode);
        else if (charCode < 0x800) {
            utf8bytes.push(0xc0 | (charCode >> 6),
                0x80 | (charCode & 0x3f));
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
            utf8bytes.push(0xe0 | (charCode >> 12),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charCode = 0x10000 + (((charCode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff));
            utf8bytes.push(0xf0 | (charCode >> 18),
                0x80 | ((charCode >> 12) & 0x3f),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f));
        }
    }
    return utf8bytes;
};

// 计算异或
const calculateXOR = (bytes) => {
    let xor = bytes[0];
    for (let i = 1; i < bytes.length; i++) {
        xor = xor ^ bytes[i]
    }
    return xor;
};

//options: https://github.com/shrhdk/text-to-svg
const text2svg = (text, options = {}) => {
    const textToSVG = TextToSVG.loadSync(); //使用默认字体
    const svg = textToSVG.getSVG(text, options);

    const {width, height} = textToSVG.getMetrics(text, options);
    return {svg, width, height}
};

const radian2degree = (radian) => {
    return radian * 180 / Math.PI
};

const degree2radian = (degree) => {
    return degree * Math.PI / 180
};

export {getImageSize, getUniqueFilename, utf8bytes2string, string2utf8bytes, calculateXOR, text2svg, radian2degree, degree2radian};
