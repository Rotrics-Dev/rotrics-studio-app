const Jimp = require('jimp');
const Normalizer = require('./Normalizer');

const TOKEN_COMMENT = 'C';
const TOKEN_EMPTY_LINE = 'N';

const file2greyscaleImage = (url, settings) => {
    const {transformation, config} = settings;

    const width = transformation.children.width.default_value;
    const height = transformation.children.height.default_value;
    const rotate = transformation.children.rotate.default_value; //degree and counter-clockwise
    const flip_model = transformation.children.flip_model.default_value;

    const invert = config.children.invert.default_value;
    const bw = config.children.bw.default_value;
    const density = config.children.density.default_value;

    let flip = 0;
    switch (flip_model) {
        case "None":
            flip = 0;
            break;
        case "Vertical":
            flip = 1;
            break;
        case "Horizontal":
            flip = 2;
            break;
        case "Both":
            flip = 3;
            break;
    }

    return Jimp.read(url).then(image => {
        return image
            .greyscale()
            .flip(!!(Math.floor(flip / 2)), !!(flip % 2))
            .resize(width * density, height * density)
            .rotate(rotate) // rotate: unit is degree and clockwise
            .scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                //idx: rgba
                if (image.bitmap.data[idx + 3] === 0) {
                    // transparent
                    for (let k = 0; k < 3; ++k) {
                        image.bitmap.data[idx + k] = 255;
                    }
                } else {
                    const value = image.bitmap.data[idx];
                    if (invert) {
                        if (value <= bw) {
                            for (let k = 0; k < 3; ++k) {
                                image.bitmap.data[idx + k] = 255;
                            }
                        } else {
                            for (let k = 0; k < 3; ++k) {
                                image.bitmap.data[idx + k] = 0;
                            }
                        }
                    } else {
                        if (value <= bw) {
                            for (let k = 0; k < 3; ++k) {
                                image.bitmap.data[idx + k] = 0;
                            }
                        } else {
                            for (let k = 0; k < 3; ++k) {
                                image.bitmap.data[idx + k] = 255;
                            }
                        }
                    }
                }
            })
            .flip(false, true)
            .background(0xffffffff);
    });
};

const greyscaleImage2toolPathStr = (image, settings) => {
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

    const bw = config.children.bw.default_value;
    const density = config.children.density.default_value;
    const line_direction = config.children.line_direction.default_value;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
        x: 1 / density,
        y: 1 / density
    });

    let content = '';
    content += `G0 F${jog_speed}\n`;
    content += `G1 F${work_speed}\n`;

    //
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

// G0 X1 Y2;this is comment --> {G: 0, X: 1, Y: 2, C: 'this is comment'}
const toolPathStr2toolPathObj = (toolPathStr) => {
    const data = [];
    const lines = toolPathStr.split('\n');
    for (let i = 0; i < lines.length; i++) {
        //trim，替换所有多个空格为一个空格
        const line = lines[i].trim().replace(/\s+/g, " ");

        // 空行也不忽略
        if (line.length === 0) {
            data.push({[TOKEN_EMPTY_LINE]: ""}); //{N: ""}
            break;
        }

        const lineObject = {}; //{G: 0, X: 0, Y: 0}
        let comment = null;
        let cmdData = null;

        //split(";")有问题，comment中也可能包含";"
        const commentIndex = line.indexOf(';');
        if (commentIndex !== -1) {
            cmdData = line.substring(0, commentIndex);
            comment = line.substring(commentIndex);
        } else {
            cmdData = line;
        }

        comment && (lineObject[TOKEN_COMMENT] = comment);
        if (cmdData) {
            const tokens = cmdData.trim().split(' ');
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                const cmdType = token.substring(0, 1);
                let value = parseFloat(token.substring(1, token.length));
                if (Number.isNaN(value)) {
                    value = token.substring(1, token.length);
                }
                lineObject[cmdType] = value;
            }
        }

        data.push(lineObject);
    }
    return data;
};

const generateToolPathLines4BW = async (url, settings) => {
    const image = await file2greyscaleImage(url, settings);
    const toolPathStr = greyscaleImage2toolPathStr(image, settings);
    //toolPathLines: Array
    const toolPathLines = toolPathStr2toolPathObj(toolPathStr);
    return toolPathLines;
};

module.exports = generateToolPathLines4BW;
