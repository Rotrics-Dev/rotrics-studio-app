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

export {
    EPS,
    ensureRange,
    toFixed,
    radian2degree,
    degree2radian
};
