const index = (toolPathLines, settings) => {
    const start_gcode = settings.working_parameters.children.start_gcode.default_value;
    const end_gcode = settings.working_parameters.children.end_gcode.default_value;

    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;
    const jog_pen_offset_value = settings.working_parameters.children.jog_pen_offset.default_value;

    const translateX = settings.transformation.children.x.default_value;
    const translateY = settings.transformation.children.y.default_value;

    const gcodeLines = [];

    for (let i = 0; i < toolPathLines.length; i++) {
        const lineObj = toolPathLines[i];
        let line = ''; //G0 X1 Y2 F3000 ;this is comment
        let cmds = []; //[G0, X1, Y2, F3000...]
        let comment = null;
        let isEmptyLine = false;
        //lineObj: {G: 0, X: 1, Y: 2, C: 'this is comment', F: '#jog_speed#'}
        //1. comment is at last
        //2. X，Y need re-compute
        //3. F: '#jog_speed#' need be replaced by actual value
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
                    value = value.toFixed(2);
                    cmds.push(key + value);
                    break;
                case 'Y':
                    value += translateY;
                    value = value.toFixed(2);
                    cmds.push(key + value);
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
                        cmds.push(`G1 Z0`)
                    } else if (value === 5) {
                        cmds.push(`G0 Z${jog_pen_offset_value}`)
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

        comment && (line += comment);

        gcodeLines.push(line);
    }

    return [start_gcode, gcodeLines.join('\n'), end_gcode].join('\n');
};
export default index;
