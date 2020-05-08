import Jimp from 'jimp';
import Normalizer from './Normalizer.js';
import getFlipFlag from "./getFlipFlag.js";

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

const file2greyscaleImage = async (url, settings) => {
    const {transformation, config} = settings;

    const width = transformation.children.width.default_value;
    const height = transformation.children.height.default_value;
    const rotation = transformation.children.rotate.default_value; //degree and counter-clockwise
    const flip_model = transformation.children.flip_model.default_value;

    const invertGreyscale = config.children.invert.default_value;
    const contrast = config.children.contrast.default_value;
    const brightness = config.children.brightness.default_value;
    const whiteClip = config.children.white_clip.default_value;
    const algorithm = config.children.algorithm.default_value;
    const density = config.children.density.default_value;

    let flip = getFlipFlag(flip_model);


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
        .resize(width * density, height * density)
        .rotate(-rotation * 180 / Math.PI)
        .flip((flip & 2) > 0, (flip & 1) > 0)
        .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            const data = img.bitmap.data;

            if (data[idx + 3] === 0) {
                data[idx] = 255;
            } else {
                if (invertGreyscale) {
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


const greyscaleImage2toolPathStrBw = (image, settings) => {
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

    function genMovement(normalizer, start, end) {
        return [
            `G0 X${normalizer.x(start.x)} Y${normalizer.y(start.y)}`,
            'M3',
            `G1 X${normalizer.x(end.x)} Y${normalizer.y(end.y)}`,
            'M5'
        ].join('\n') + '\n';
    }

    function bitEqual(a, b) {
        return (a <= bw && b <= bw) || (a > bw && b > bw);
    }

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const {config, working_parameters} = settings;

    const work_speed = working_parameters.children.work_speed.placeholder;
    const jog_speed = working_parameters.children.jog_speed.placeholder;

    // const bw = config.children.bw.default_value;
    const bw = 168;
    const density = config.children.density.default_value;
    const line_direction = config.children.line_direction.default_value;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
        x: 1 / density,
        y: 1 / density
    });

    let content = '';
    content += `G0 F${jog_speed}\n`;
    content += `G1 F${work_speed}\n`;

    if (!line_direction || line_direction === 'Horizontal') {
        const direction = {x: 1, y: 0};
        for (let j = 0; j < height; j++) {
            let len = 0;
            const isReverse = (j % 2 !== 0);
            const sign = isReverse ? -1 : 1;
            for (let i = (isReverse ? width - 1 : 0); isReverse ? i >= 0 : i < width; i += len * sign) {
                const idx = i * 4 + j * width * 4;
                if (image.bitmap.data[idx] <= bw) {
                    const start = {
                        x: i,
                        y: j
                    };
                    len = extractSegment(image.bitmap.data, start, image.bitmap, direction, sign);
                    const end = {
                        x: start.x + direction.x * len * sign,
                        y: start.y + direction.y * len * sign
                    };
                    content += genMovement(normalizer, start, end);
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
                if (image.bitmap.data[idx] <= bw) {
                    const start = {
                        x: i,
                        y: j
                    };
                    len = extractSegment(image.bitmap.data, start, image.bitmap, direction, sign);
                    const end = {
                        x: start.x + direction.x * len * sign,
                        y: start.y + direction.y * len * sign
                    };
                    content += genMovement(normalizer, start, end);
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
                    if (image.bitmap.data[idx] <= bw) {
                        const start = {
                            x: i,
                            y: j
                        };
                        len = extractSegment(image.bitmap.data, start, image.bitmap, direction, sign);
                        const end = {
                            x: start.x + direction.x * len * sign,
                            y: start.y + direction.y * len * sign
                        };
                        content += genMovement(normalizer, start, end);
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
                    if (image.bitmap.data[idx] <= bw) {
                        let start = {
                            x: i,
                            y: j
                        };
                        len = extractSegment(image.bitmap.data, start, image.bitmap, direction, sign);
                        const end = {
                            x: start.x + direction.x * len * sign,
                            y: start.y + direction.y * len * sign
                        };
                        content += genMovement(normalizer, start, end);
                    } else {
                        len = 1;
                    }
                }
            }
        }
    }
    content += 'G0 X0 Y0\n';
    return content;
};


const greyscaleImage2toolPathStrGs = async (img, settings) => {
    const bwThreshold = 168;

    const {config, working_parameters} = settings;
    const work_speed = working_parameters.children.work_speed.placeholder;
    const dwell_time = working_parameters.children.dwell_time.placeholder;
    const density = config.children.density.default_value;


    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
        x: 1 / density,
        y: 1 / density
    });

    let progress = 0;
    let content = '';
    content += `G1 F${work_speed}\n`;

    for (let i = 0; i < width; ++i) {
        const isReverse = (i % 2 === 0);
        for (let j = (isReverse ? height : 0); isReverse ? j >= 0 : j < height; isReverse ? j-- : j++) {
            const idx = j * width * 4 + i * 4;
            if (img.bitmap.data[idx] < bwThreshold) {
                content += `G1 X${normalizer.x(i)} Y${normalizer.y(j)}\n`;
                content += 'M03\n';
                content += `G4 P${dwell_time}\n`;
                content += 'M05\n';
            }
        }
    }
    content += 'G0 X0 Y0';

    return content;
};

const toolPathStr4greyscale = async (url, settings) => {
    const image = await file2greyscaleImage(url, settings);
    const movement_mode = settings.config.children.movement_mode.default_value;
    if (movement_mode === "greyscale-line") {
        return greyscaleImage2toolPathStrBw(image, settings);
    } else if (movement_mode === "greyscale-dot") {
        return greyscaleImage2toolPathStrGs(image, settings);
    }
    return greyscaleImage2toolPathStrGs(image, settings);
};

export default toolPathStr4greyscale;
