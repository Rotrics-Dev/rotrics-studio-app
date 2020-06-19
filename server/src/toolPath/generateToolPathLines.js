import {toolPathStr4bw} from './toolPathStr4bw.js';
import toolPathStr4svg from './toolPathStr4svg.js';
import toolPathStr2toolPathLines from "./toolPathStr2toolPathLines.js";
import toolPathStr4greyscale from "./toolPathStr4greyscale.js";
import {TOOL_PATH_RENDER_METHOD_POINT, TOOL_PATH_RENDER_METHOD_LINE} from "../constants.js"

const generateToolPathLines = async (fileType, url, settings) => {
    let toolPathStr = null;
    switch (fileType) {
        case "bw":
            toolPathStr = await toolPathStr4bw(url, settings);
            break;
        case "greyscale":
            toolPathStr = await toolPathStr4greyscale(url, settings);
            break;
        case "svg":
        case "text":
            toolPathStr = await toolPathStr4svg(url, settings);
            break;
    }
    toolPathStr = preHandle(toolPathStr, settings);
    const toolPathLines = toolPathStr2toolPathLines(toolPathStr);
    return toolPathLines;
};

//增加start_gcode, end_gcode, 渲染模式
const preHandle = (toolPathStr, settings) => {
    //对greyscale有两种模式: line和dot，要使用不同的渲染模式
    //为什么要直接写在gcode中: 用户可能导出gcode，再加载到软件中，想要正确渲染，渲染方式必须写在gcode中
    let toolPathRenderMethod = TOOL_PATH_RENDER_METHOD_LINE;
    if (settings.config.children.movement_mode) {
        const movement_mode = settings.config.children.movement_mode.default_value;
        if (movement_mode === "greyscale-dot") {
            toolPathRenderMethod = TOOL_PATH_RENDER_METHOD_POINT;
        }
    }
    const start_gcode = settings.start_gcode.default_value;
    const end_gcode = settings.end_gcode.default_value;
    return (toolPathRenderMethod + "\n" + start_gcode + toolPathStr + end_gcode);
};

export default generateToolPathLines;
