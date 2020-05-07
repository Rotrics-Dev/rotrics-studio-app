import toolPathStr4bw from './toolPathStr4bw.js';
import toolPathStr4svg from './toolPathStr4svg.js';
import toolPathStr2toolPathLines from "./toolPathStr2toolPathLines.js";

const generateToolPathLines = async (fileType, url, settings) => {
    let toolPathStr = null;
    switch (fileType) {
        case "bw":
            toolPathStr = await toolPathStr4bw(url, settings);
            break;
        case "greyscale":
            break;
        case "svg-vector":
        case "text":
            toolPathStr = await toolPathStr4svg(url, settings);
            break;
    }
    const toolPathLines = toolPathStr2toolPathLines(toolPathStr);
    return toolPathLines;
};

export default generateToolPathLines;
