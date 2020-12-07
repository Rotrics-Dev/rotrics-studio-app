import {toolPathStr4bw} from './toolPathStr4bw.js';
import toolPathStr4svg from './toolPathStr4svg.js';
import toolPathStr2toolPathLines from "./toolPathStr2toolPathLines.js";
import toolPathStr4greyscale from "./toolPathStr4greyscale.js";

const generateToolPathLines = async (url, fileType, settings) => {
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
    return toolPathStr2toolPathLines(toolPathStr);
};

export default generateToolPathLines;
