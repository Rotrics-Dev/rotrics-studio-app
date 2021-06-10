import {v4 as uuidv4} from 'uuid';

// epsilon
const EPS = 1e-6;

/**
 * Ensure numeric range.
 *
 * @param {number} value - Number to be fixed
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @return {number}
 */
const ensureRange = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
};

/**
 * Wrapper for `toFixed`.
 *
 * @param value
 * @param fractionDigits
 * @return {*|string}
 */
const toFixed = (value, fractionDigits) => {
    const stringValue = '' + value;
    const pos = stringValue.indexOf('.');
    if (pos !== -1) {
        const d = stringValue.length - pos - 1;
        if (d > fractionDigits) {
            // actual fraction digits > maximum fraction digits
            return Number(value.toFixed(fractionDigits));
        }
    }
    return value; // no fix needed
};

const radian2degree = (radian) => {
    return radian * 180 / Math.PI
};

const degree2radian = (degree) => {
    return degree * Math.PI / 180
};

const getUuid = () => {
    return uuidv4();
};

/**
 * 根据限制，重新计算width，height
 * @param width
 * @param height
 * @param sizeRestriction 对size的限制，max/min; sizeRestriction: {min_width, max_width, min_height, max_height}
 * @returns {width, height} 计算后的
 * 如下图，分8种情况
 height
 ^
 |  7  |     6     |    5
 |     |           |
 |----------------------------- max_height
 |     |           |
 |     |           |
 |  8  |     9     |     4
 |     |           |
 |     |           |
 |----------------------------- min_height
 |     |           |
 |  1  |     2     |     3
 |     |           |
 |-----------------------------> width
 min_width      mix_width
 */
const getAvailableSize = (width, height, sizeRestriction) => {
    const {min_width, max_width, min_height, max_height} = sizeRestriction;
    //case-1 ok
    if (width <= min_width && height <= min_height) {
        const scaleWidth = min_width / width;
        const scaleHeight = min_height / height;
        const scale = Math.max(scaleWidth, scaleHeight);
        return {width: width * scale, height: height * scale}
    }
    //case-5 ok
    if (width >= max_width && height >= max_height) {
        const scaleWidth = max_width / width;
        const scaleHeight = max_height / height;
        const scale = Math.min(scaleWidth, scaleHeight);
        return {width: width * scale, height: height * scale}
    }
    //case-2 ok
    if (width >= min_width && width <= max_width &&
        height <= min_height) {
        return {width, height}
    }
    //case-6 ok
    if (width >= min_width && width <= max_width &&
        height >= max_height) {
        const scale = max_height / height;
        return {width: width * scale, height: height * scale}
    }
    //case-8 ok
    if (width <= min_width &&
        height >= min_height && height <= max_height) {
        return {width, height}
    }
    //case-4 ok
    if (width >= max_width &&
        height >= min_height && height <= max_height) {
        const scale = max_width / width;
        return {width: width * scale, height: height * scale}
    }
    //case-3 ok
    if (width >= max_width && height <= min_height) {
        const scale = max_width / width;
        return {width: width * scale, height: height * scale}
    }
    //case-7 ok
    if (width <= min_width && height >= max_height) {
        const scale = max_height / height;
        return {width: width * scale, height: height * scale}
    }
    //case-9
    // if (img_width >= min_width && img_width <= max_width &&
    //     img_height >= min_height && img_height <= max_height) {
    // }
    return {width, height}
};

/**
 * @param timestampMS 毫秒值
 * @returns {string}
 */
const timestamp2date = (timestampMS) => {
    const d = new Date(timestampMS),
        year = d.getFullYear(),
        month = d.getMonth() + 1,
        day = d.getDate(),
        hour = d.getHours(),
        minute = d.getMinutes();
    return year + "-" +
        (month < 10 ? "0" + month : month) + "-" +
        (day < 10 ? "0" + day : day) + " " +
        (hour < 10 ? "0" + hour : hour) + ":" +
        (minute < 10 ? "0" + minute : minute);
};

// const d = new Date(),
//     year = d.getFullYear(),
//     month = d.getMonth() + 1,
//     day = d.getDate(),
//     hour = d.getHours(),
//     minute = d.getMinutes(),
//     second = d.getSeconds();
// return year + "-" +
//     (month < 10 ? "0" + month : month) + "-" +
//     (day < 10 ? "0" + day : day) + "-" +
//     (hour < 10 ? "0" + hour : hour) + "-" +
//     (minute < 10 ? "0" + minute : minute) + "-" +
//     (second < 10 ? "0" + second : second);

/**
 * Scratch cast to number.
 * Treats NaN as 0.
 * In Scratch 2.0, this is captured by `interp.numArg.`
 * @param {*} value Value to cast to number.
 * @return {number} The Scratch-casted number value.
 */
const str2Number  = (value) =>{
    // If value is already a number we don't need to coerce it with
    // Number().
    if (typeof value === 'number') {
        // Scratch treats NaN as 0, when needed as a number.
        // E.g., 0 + NaN -> 0.
        if (Number.isNaN(value)) {
            return 0;
        }
        return value;
    }
    const n = Number(value);
    if (Number.isNaN(n)) {
        // Scratch treats NaN as 0, when needed as a number.
        // E.g., 0 + NaN -> 0.
        return 0;
    }
    return n;
};

/**
 * 判断是否打开高级设置
 * @returns 
 */
 const getIsAdvance = () => {
    const advance = localStorage.getItem('ADVANCE')
    return advance 
        ? Number(advance) === 1 
        : false
}

export {
    EPS,
    ensureRange,
    toFixed,
    radian2degree,
    degree2radian,
    getUuid,
    getAvailableSize,
    timestamp2date,
    str2Number,
    getIsAdvance
};

