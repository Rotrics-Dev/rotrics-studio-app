import http from "http";
import SVGParser, {flip, rotate, scale, sortShapes, translate} from '../SVGParser/index.js';
import {svgToSegments} from './SVGFill.js';
import Normalizer from './Normalizer.js';
import getFlipFlag from "./getFlipFlag.js";
import {degree2radian} from '../utils';

function pointEqual(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}

const svg2toolPathStr = async (url, settings) => {
    const {transformation, config, working_parameters} = settings;

    const work_speed_placeholder = working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = working_parameters.children.jog_speed.placeholder;
    const power_placeholder = working_parameters.children.power.placeholder;

    const originWidth = transformation.children.width_pixel.default_value;
    const originHeight = transformation.children.height_pixel.default_value;
    const rotation = transformation.children.rotation.default_value; //degree and counter-clockwise
    const flip_model = transformation.children.flip_model.default_value;

    let flipFlag = getFlipFlag(flip_model);

    const targetWidth = transformation.children.width_mm.default_value;
    const targetHeight = transformation.children.height_mm.default_value;

    const fillEnabled = config.children.fill.default_value;
    const fillDensity = config.children.fill.children.fill_density.default_value;
    const optimizePath = config.children.optimize_path.default_value;

    const svgStr = await getSvgStr(url);

    const svgParser = new SVGParser();
    const svg = await svgParser.parse(svgStr);

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
    let toolPathLines = [];
    let current = null;

    //if write&draw, move up z, set speed, move to start xy, move z to 0, then start
    const segment0 = segments[0];
    toolPathLines.push('M5');
    toolPathLines.push(`G0 F${jog_speed_placeholder}`);
    toolPathLines.push(`G1 F${work_speed_placeholder}`);
    // toolPathLines.push(`G0 X${normalizer.x(segment0.start[0])} Y${normalizer.y(segment0.start[1])}`);
    // toolPathLines.push('G0 Z0');

    for (const segment of segments) {
        // G0 move to start
        if (!current || current && !(pointEqual(current, segment.start))) {
            if (current) {
                toolPathLines.push('M5');
            }
            // Move to start point
            toolPathLines.push(`G0 X${normalizer.x(segment.start[0])} Y${normalizer.y(segment.start[1])}`);
            toolPathLines.push(`M3 S${power_placeholder}`);
        }
        // G0 move to end
        toolPathLines.push(`G1 X${normalizer.x(segment.end[0])} Y${normalizer.y(segment.end[1])}`);
        current = segment.end;
    }
    toolPathLines.push('M5');
    toolPathLines.push('G0 X0 Y0');
    return toolPathLines.join('\n');
};

const getSvgStr = async (url) => {
    let promise = new Promise((resolve, reject) => {
        http.get(url, (req, res) => {
            let svg = '';
            req.on('data', (data) => {
                svg += data;
            });
            req.on('end', () => {
                resolve(svg);
            });
        })
    });
    return await promise;
};

const toolPathStr4svg = async (url, settings) => {
    return await svg2toolPathStr(url, settings);
};

export default toolPathStr4svg;
