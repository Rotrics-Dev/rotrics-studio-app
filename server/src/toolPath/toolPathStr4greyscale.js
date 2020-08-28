import Jimp from 'jimp';
import Normalizer from './Normalizer.js';
import getFlipFlag from "./getFlipFlag.js";
import {img2toolPathStrBw} from './toolPathStr4bw.js';

const algorithms = {
    Atkinson: [
        [0, 0, 1 / 8, 1 / 8],
        [1 / 8, 1 / 8, 1 / 8, 0],
        [0, 1 / 8, 0, 0]
    ],
    Burkes: [
        [0, 0, 0, 8 / 32, 4 / 32],
        [2 / 32, 4 / 32, 8 / 32, 4 / 32, 2 / 32]
    ],
    FloydSteinburg: [
        [0, 0, 7 / 16],
        [3 / 16, 5 / 16, 1 / 16]
    ],
    JarvisJudiceNinke: [
        [0, 0, 0, 7 / 48, 5 / 48],
        [3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48],
        [1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48]
    ],
    Sierra2: [
        [0, 0, 0, 4 / 16, 3 / 16],
        [1 / 16, 2 / 16, 3 / 16, 2 / 16, 1 / 16]
    ],
    Sierra3: [
        [0, 0, 0, 5 / 32, 3 / 32],
        [2 / 32, 4 / 32, 5 / 32, 4 / 32, 2 / 32],
        [0, 2 / 32, 3 / 32, 2 / 32, 0]
    ],
    SierraLite: [
        [0, 0, 2 / 4],
        [1 / 4, 1 / 4, 0]
    ],
    Stucki: [
        [0, 0, 0, 8 / 42, 4 / 42],
        [2 / 42, 4 / 42, 8 / 42, 4 / 42, 2 / 42],
        [1 / 42, 2 / 42, 4 / 42, 2 / 42, 1 / 42]
    ]
};

const bit = function (x) {
    if (x >= 128) {
        return 255;
    } else {
        return 0;
    }
};

const normalize = function (x) {
    if (x < 0) {
        return 0;
    } else if (x > 255) {
        return 255;
    }
    return Math.round(x);
};

/**
 * 读取文件，然后转为Jimp img，并根据参数处理底层的bitmap data
 * 模式：greyscale
 * @param url
 * @param settings
 * {transformation, config}
 * config: {invert, contrast, brightness, white_clip, algorithm, density}
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
    const contrast = config.children.contrast.default_value;
    const brightness = config.children.brightness.default_value;
    const whiteClip = config.children.white_clip.default_value;
    const algorithm = config.children.algorithm.default_value;
    const density = config.children.density.default_value;

    const matrix = algorithms[algorithm];
    const _matrixHeight = matrix.length;
    const _matrixWidth = matrix[0].length;

    let _startingOffset = 0;
    for (let k = 1; k < _matrixWidth; k++) {
        if (matrix[0][k] > 0) {
            _startingOffset = k - 1;
            break;
        }
    }

    const img = await Jimp.read(url);

    img
        .background(0xffffffff)
        .brightness((brightness - 50.0) / 50)
        .quality(100)
        .contrast((contrast - 50.0) / 50)
        .greyscale()
        // .flip((flipFlag & 2) > 0, (flipFlag & 1) > 0)
        .flip(!!(Math.floor(flipFlag / 2)), !!(flipFlag % 2))
        .resize(width * density, height * density)
        .rotate(rotation)// rotate: unit is degree and clockwise
        .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            const data = img.bitmap.data;

            if (data[idx + 3] === 0) {
                data[idx] = 255;
            } else {
                if (invert) {
                    data[idx] = 255 - data[idx];
                    if (data[idx] < 255 - whiteClip) {
                        data[idx] = 0;
                    }
                } else {
                    if (data[idx] >= whiteClip) {
                        data[idx] = 255;
                    }
                }
            }
        });

    // serpentine path
    for (let y = 0; y < img.bitmap.height; y++) {
        const reverse = (y & 1) === 1;

        for (let x = reverse ? img.bitmap.width - 1 : 0; reverse ? x >= 0 : x < img.bitmap.width; reverse ? x-- : x++) {
            const index = (y * img.bitmap.width + x) << 2;
            const origin = img.bitmap.data[index];

            img.bitmap.data[index] = bit(origin);
            const err = origin - img.bitmap.data[index];

            for (let i = 0; i < _matrixWidth; i++) {
                for (let j = 0; j < _matrixHeight; j++) {
                    if (matrix[j][i] > 0) {
                        let _x = reverse ? x - (i - _startingOffset) : x + (i - _startingOffset);
                        let _y = y + j;
                        if (_x >= 0 && _x < img.bitmap.width && _y < img.bitmap.height) {
                            let _idx = index + (_x - x) * 4 + (_y - y) * img.bitmap.width * 4;
                            img.bitmap.data[_idx] = normalize(img.bitmap.data[_idx] + matrix[j][i] * err);
                        }
                    }
                }
            }
        }
    }

    return img;
};

const img2toolPathStrGs = (img, settings) => {
    const {config, working_parameters} = settings;

    const bw = config.children.bw.default_value;
    const density = config.children.density.default_value;

    const work_speed_placeholder = working_parameters.children.work_speed.placeholder;
    const dwell_time_placeholder = working_parameters.children.dwell_time.placeholder;
    const engrave_time_placeholder = working_parameters.children.engrave_time.placeholder;
    const power_placeholder = working_parameters.children.power.placeholder;

    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
        x: 1 / density,
        y: 1 / density
    });

    let toolPathLines = [];
    toolPathLines.push('G0 F1000'); //G0 default speed is 1000
    toolPathLines.push(`G1 F${work_speed_placeholder}`);
    toolPathLines.push('G0 Z0');
    for (let i = 0; i < width; ++i) {
        const isReverse = (i % 2 === 0);
        for (let j = (isReverse ? height : 0); isReverse ? j >= 0 : j < height; isReverse ? j-- : j++) {
            const idx = j * width * 4 + i * 4;
            if (img.bitmap.data[idx] < bw) {
                toolPathLines.push(`G1 X${normalizer.x(i)} Y${normalizer.y(j)}`);
                toolPathLines.push(`G4 P${dwell_time_placeholder}`);
                toolPathLines.push(`M3 S${power_placeholder}`);
                toolPathLines.push(`G4 P${engrave_time_placeholder}`);
                toolPathLines.push('M5');
            }
        }
    }
    toolPathLines.push('G0 X0 Y0');
    return toolPathLines.join('\n');
};

const toolPathStr4greyscale = async (url, settings) => {
    const img = await file2img(url, settings);
    const movement_mode = settings.config.children.movement_mode.default_value;
    if (movement_mode === "greyscale-line") {
        img.mirror(false, true);
        return img2toolPathStrBw(img, settings);
    } else if (movement_mode === "greyscale-dot") {
        return img2toolPathStrGs(img, settings);
    }
    return img2toolPathStrGs(img, settings);
};

export default toolPathStr4greyscale;
