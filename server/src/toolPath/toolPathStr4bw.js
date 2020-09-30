import Jimp from 'jimp';
import Normalizer from './Normalizer.js';
import getFlipFlag from "./getFlipFlag.js";

/**
 * 读取文件，然后转为Jimp img，并根据参数处理底层的bitmap data
 * 模式：bw
 * @param url
 * @param settings
 * {transformation, config}
 * config: {invert, bw, density}
 * @returns {Promise<DepreciatedJimp>}
 */
const file2img = async (url, settings) => {
    const {transformation, config} = settings;

    const width = transformation.children.width.default_value;
    const height = transformation.children.height.default_value;
    const rotation = transformation.children.rotation.default_value; //degree and counter-clockwise
    const flip_model = transformation.children.flip_model.default_value;
    let flipFlag = getFlipFlag(flip_model);

    const invert = config.children.invert.default_value;
    const bw = config.children.bw.default_value;
    const density = config.children.density.default_value;

    const img = await Jimp.read(url);

    img
        .greyscale()
        .flip(!!(Math.floor(flipFlag / 2)), !!(flipFlag % 2))
        .resize(width * density, height * density)
        .rotate(rotation) // rotation: unit is degree and clockwise
        .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            //idx: rgba
            if (img.bitmap.data[idx + 3] === 0) {
                // transparent
                for (let k = 0; k < 3; ++k) {
                    img.bitmap.data[idx + k] = 255;
                }
            } else {
                const value = img.bitmap.data[idx];
                if (invert) {
                    if (value <= bw) {
                        for (let k = 0; k < 3; ++k) {
                            img.bitmap.data[idx + k] = 255;
                        }
                    } else {
                        for (let k = 0; k < 3; ++k) {
                            img.bitmap.data[idx + k] = 0;
                        }
                    }
                } else {
                    if (value <= bw) {
                        for (let k = 0; k < 3; ++k) {
                            img.bitmap.data[idx + k] = 0;
                        }
                    } else {
                        for (let k = 0; k < 3; ++k) {
                            img.bitmap.data[idx + k] = 255;
                        }
                    }
                }
            }
        })
        .flip(false, true)
        .background(0xffffffff);

    return img;
};

/**
 * 将Jimp img转为tool path string
 * 模式：bw
 * @param img
 * @param settings
 * {config, working_parameters}
 * config: {bw, density, line_direction}
 * working_parameters: {work_speed, jog_speed}
 * @returns {string}
 */
const img2toolPathStrBw = (img, settings) => {
    function extractSegment(data, start, box, direction, sign) {
        let len = 1;

        function idx(pos) {
            return pos.x * 4 + pos.y * box.width * 4;
        }

        for (; ;) {
            const cur = {
                x: start.x + direction.x * len * sign,
                y: start.y + direction.y * len * sign
            };
            if (!bitEqual(data[idx(cur)], data[idx(start)]) ||
                cur.x < 0 || cur.x >= box.width ||
                cur.y < 0 || cur.y >= box.height) {
                break;
            }
            len += 1;
        }
        return len;
    }

    function genMovements(normalizer, start, end, power_placeholder) {
        return [
            `G0 X${normalizer.x(start.x)} Y${normalizer.y(start.y)}`,
            `M3 S${power_placeholder}`,
            `G1 X${normalizer.x(end.x)} Y${normalizer.y(end.y)}`,
            'M5'
        ];
    }

    function bitEqual(a, b) {
        return (a <= bw && b <= bw) || (a > bw && b > bw);
    }

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const {config, working_parameters} = settings;

    const bw = config.children.bw.default_value;
    const density = config.children.density.default_value;
    const line_direction = config.children.line_direction.default_value;

    const work_speed_placeholder = working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = working_parameters.children.jog_speed.placeholder;
    const power_placeholder = working_parameters.children.power.placeholder;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
        x: 1 / density,
        y: 1 / density
    });

    let toolPathLines = [];
    toolPathLines.push(`G0 F${jog_speed_placeholder}`);
    toolPathLines.push(`G1 F${work_speed_placeholder}`);
    // toolPathLines.push('G0 Z0');
    if (!line_direction || line_direction === 'Horizontal') {
        const direction = {x: 1, y: 0};
        for (let j = 0; j < height; j++) {
            let len = 0;
            const isReverse = (j % 2 !== 0);
            const sign = isReverse ? -1 : 1;
            for (let i = (isReverse ? width - 1 : 0); isReverse ? i >= 0 : i < width; i += len * sign) {
                const idx = i * 4 + j * width * 4;
                if (img.bitmap.data[idx] <= bw) {
                    const start = {
                        x: i,
                        y: j
                    };
                    len = extractSegment(img.bitmap.data, start, img.bitmap, direction, sign);
                    const end = {
                        x: start.x + direction.x * len * sign,
                        y: start.y + direction.y * len * sign
                    };
                    toolPathLines = toolPathLines.concat(genMovements(normalizer, start, end, power_placeholder));
                } else {
                    len = 1;
                }
            }
        }
    } else if (line_direction === 'Vertical') {
        let direction = {x: 0, y: 1};
        for (let i = 0; i < width; ++i) {
            let len = 0;
            const isReverse = (i % 2 !== 0);
            const sign = isReverse ? -1 : 1;
            for (let j = (isReverse ? height - 1 : 0); isReverse ? j >= 0 : j < height; j += len * sign) {
                const idx = i * 4 + j * width * 4;
                if (img.bitmap.data[idx] <= bw) {
                    const start = {
                        x: i,
                        y: j
                    };
                    len = extractSegment(img.bitmap.data, start, img.bitmap, direction, sign);
                    const end = {
                        x: start.x + direction.x * len * sign,
                        y: start.y + direction.y * len * sign
                    };
                    toolPathLines = toolPathLines.concat(genMovements(normalizer, start, end, power_placeholder));
                } else {
                    len = 1;
                }
            }
        }
    } else if (line_direction === 'Diagonal') {
        const direction = {x: 1, y: -1};
        for (let k = 0; k < width + height - 1; k++) {
            let len = 0;
            const isReverse = (k % 2 !== 0);
            const sign = isReverse ? -1 : 1;
            for (let i = (isReverse ? width - 1 : 0); isReverse ? i >= 0 : i < width; i += len * sign) {
                const j = k - i;
                if (j < 0 || j > height) {
                    len = 1; // FIXME: optimize
                } else {
                    const idx = i * 4 + j * width * 4;
                    if (img.bitmap.data[idx] <= bw) {
                        const start = {
                            x: i,
                            y: j
                        };
                        len = extractSegment(img.bitmap.data, start, img.bitmap, direction, sign);
                        const end = {
                            x: start.x + direction.x * len * sign,
                            y: start.y + direction.y * len * sign
                        };
                        toolPathLines = toolPathLines.concat(genMovements(normalizer, start, end, power_placeholder));
                    } else {
                        len = 1;
                    }
                }
            }
        }
    } else if (line_direction === 'Diagonal2') {
        const direction = {x: 1, y: 1};
        for (let k = -height; k <= width; k++) {
            const isReverse = (k % 2 !== 0);
            const sign = isReverse ? -1 : 1;
            let len = 0;
            for (let i = (isReverse ? width - 1 : 0); isReverse ? i >= 0 : i < width; i += len * sign) {
                const j = i - k;
                if (j < 0 || j > height) {
                    len = 1;
                } else {
                    const idx = i * 4 + j * width * 4;
                    if (img.bitmap.data[idx] <= bw) {
                        let start = {
                            x: i,
                            y: j
                        };
                        len = extractSegment(img.bitmap.data, start, img.bitmap, direction, sign);
                        const end = {
                            x: start.x + direction.x * len * sign,
                            y: start.y + direction.y * len * sign
                        };
                        toolPathLines = toolPathLines.concat(genMovements(normalizer, start, end, power_placeholder));
                    } else {
                        len = 1;
                    }
                }
            }
        }
    }
    toolPathLines.push('G0 X0 Y0');
    return toolPathLines.join('\n');
};

const toolPathStr4bw = async (url, settings) => {
    const img = await file2img(url, settings);
    return img2toolPathStrBw(img, settings);
};

export {toolPathStr4bw, img2toolPathStrBw};
