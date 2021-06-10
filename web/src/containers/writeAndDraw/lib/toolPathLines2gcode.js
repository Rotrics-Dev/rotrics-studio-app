// import {GO_TO_WORK_HEIGHT} from "../../../constants";
// import {persistents, WORK_HEIGHT_PLACE_HOLDER} from "../../../reducers/persistentData";
// import {FRONT_END} from "../../../utils/workAreaUtils";

const toolPathLines2gcode = (toolPathLines, settings, write_and_draw, advance) => {
    console.log('toolPathLines')
    console.log(toolPathLines)
    console.log('绘画 生成Gcode 是否为高级模式 ' + advance)
    console.log('settings')
    console.log(settings)
    console.log('write_and_draw')
    console.log(write_and_draw)
    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;
    const jog_pen_offset = write_and_draw.jog_pen_offset.default_value;//空闲抬笔高度
    // const workHeight = persistents.getFloat(FRONT_END.PEN);

    const {x, y} = settings.transformation.children;
    const translateX = x.default_value;
    const translateY = y.default_value;

    const gcodeLines = [];

    for (let i = 0; i < toolPathLines.length; i++) {
        const lineObj = toolPathLines[i];
        let line = ''; //G0 X1 Y2 F3000 ;this is comment
        let cmds = []; //[G0, X1, Y2, F3000...]
        let comment = null;
        let isEmptyLine = false;
        
        // console.log(lineObj)

        //lineObj: {G: 0, X: 1, Y: 2, C: 'this is comment', F: '#jog_speed#'}
        //1. comment放在最后
        //2. X，Y需要重新计算
        //3. F: '#jog_speed#'需要替换为实际值
        Object.keys(lineObj).forEach((key) => {
            let value = lineObj[key];
            switch (key) {
                case 'C':
                    // C: comment
                    comment = value;
                    break;
                case 'N':
                    //N: empty line
                    isEmptyLine = true;
                    break;
                case 'X':
                    value += translateX;
                    value = value.toFixed(2)
                    // 高级模式下，需要将X替换为E
                    cmds.push(`${advance ? 'E' : key}` + value);
                    break;
                case 'Y':
                    value += translateY;
                    value = value.toFixed(2)
                    cmds.push(key + value);
                    // console.log(key + value)
                    break;
                case 'F':
                    if (value === work_speed_placeholder) {
                        value = work_speed_value;
                    } else if (value === jog_speed_placeholder) {
                        value = jog_speed_value;
                    }
                    cmds.push(key + value);
                    break;
                case 'M':
                    if (value === 3) {
                        // cmds.push(`G1 Z${workHeight}`)
                        cmds.push(`G1 Z0`)
                    } else if (value === 5) {
                        //TODO
                        // cmds.push(`G0 Z${(workHeight - -jog_pen_offset)}`)
                        cmds.push(`G0 Z${jog_pen_offset}`)
                    } else {
                        cmds.push(key + value);
                    }
                    break;
                case 'S': //M3 S#power#, only for laser, ignore if others
                    break;
                default:
                    cmds.push(key + value);
                    break
            }
        });

        if (isEmptyLine) {
            gcodeLines.push("\n");
            continue;
        }

        cmds.length > 0 && (line = cmds.join(' '));

        //comment放在最后面
        comment && (line += comment);

        gcodeLines.push(line);
    }

    let gcodeStr = gcodeLines.join('\n') + '\n';

    console.log(gcodeStr)
    return gcodeStr;
};
export default toolPathLines2gcode;
