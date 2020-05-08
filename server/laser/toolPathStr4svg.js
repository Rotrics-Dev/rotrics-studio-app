import path from 'path'
import SVGParser, {flip, rotate, scale, sortShapes, translate} from '../SVGParser/index.js';
import {svgToSegments} from './SVGFill.js';
import Normalizer from './Normalizer.js';
import getFlipFlag from "./getFlipFlag.js";
import {degree2radian} from '../../shared/lib/numeric-utils.js';

function pointEqual(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}

const svg2toolPathStr = async (url, settings) => {
    let __dirname = path.resolve();

    const urlItems = url.split("/");
    const modelPath = path.join(__dirname) + '/static/upload/' + urlItems[urlItems.length - 1];

    console.log("modelPath: " + modelPath)

    const {transformation, config, working_parameters} = settings;

    const workSpeed = working_parameters.children.work_speed.placeholder;
    const jogSpeed = working_parameters.children.jog_speed.placeholder;


    const originWidth = transformation.children.image_width.default_value;
    const originHeight = transformation.children.image_height.default_value;
    const rotation = transformation.children.rotate.default_value; //degree and counter-clockwise
    const flip_model = transformation.children.flip_model.default_value;

    let flipFlag = getFlipFlag(flip_model);

    const targetWidth = transformation.children.width.default_value;
    const targetHeight = transformation.children.height.default_value;

    const fillEnabled = config.children.fill.default_value;
    const fillDensity = config.children.fill.children.fill_density.default_value;
    const optimizePath = config.children.optimize_path.default_value;

    const svgParser = new SVGParser();

    const svg = await svgParser.parseFile(modelPath);
    flip(svg, 1);
    flip(svg, flipFlag);
    scale(svg, {
        x: targetWidth / originWidth,
        y: targetHeight / originHeight
    });
    if (optimizePath) {
        sortShapes(svg);
    }
    rotate(svg, degree2radian(rotation)); // rotate: unit is radians and counter-clockwise
    translate(svg, -svg.viewBox[0], -svg.viewBox[1]);

    const normalizer = new Normalizer(
        'Center',
        svg.viewBox[0],
        svg.viewBox[0] + svg.viewBox[2],
        svg.viewBox[1],
        svg.viewBox[1] + svg.viewBox[3],
        {x: 1, y: 1}
    );

    const segments = svgToSegments(svg, {
        width: svg.viewBox[2],
        height: svg.viewBox[3],
        fillEnabled: fillEnabled,
        fillDensity: fillDensity
    });

    // second pass generate gcode
    let content = '';
    content += `G0 F${jogSpeed}\n`;
    content += `G1 F${workSpeed}\n`;

    let current = null;
    for (const segment of segments) {
        // G0 move to start
        if (!current || current && !(pointEqual(current, segment.start))) {
            if (current) {
                content += 'M5\n';
            }

            // Move to start point
            content += `G0 X${normalizer.x(segment.start[0])} Y${normalizer.y(segment.start[1])}\n`;
            content += 'M3\n';
        }

        // G0 move to end
        content += `G1 X${normalizer.x(segment.end[0])} Y${normalizer.y(segment.end[1])}\n`;

        current = segment.end;
    }
    // turn off
    if (current) {
        content += 'M5\n';
    }

    // move to work zero
    content += 'G0 X0 Y0\n';

    return content;
};


const toolPathStr4svg = async (url, settings) => {
    return await svg2toolPathStr(url, settings);
};

export default toolPathStr4svg;
