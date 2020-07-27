const toolPathLines2gcode = (toolPathLines, settings) => {
    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;
    const dwell_time_placeholder = settings.working_parameters.children.dwell_time.placeholder;
    const dwell_time2_placeholder = settings.working_parameters.children.dwell_time2.placeholder;
    const power_placeholder = settings.working_parameters.children.power.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;
    const dwell_time_value = settings.working_parameters.children.dwell_time.default_value;
    const dwell_time2_value = settings.working_parameters.children.dwell_time2.default_value;
    const power_value = settings.working_parameters.children.power.default_value;

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
                    cmds.push(key + value);
                    break;
                case 'Y':
                    value += translateY;
                    value = value.toFixed(2)
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
                case 'P': // G4 P${dwell_time_placeholder} or G4 P${dwell_time2_placeholder}
                    if (value === dwell_time_placeholder) {
                        value = dwell_time_value;
                    } else if (value === dwell_time2_placeholder) {
                        value = dwell_time2_value;
                    }
                    cmds.push(key + value);
                    break;
                case 'S': // M3 S${power_placeholder}
                    if (value === power_placeholder) {
                        value = Math.floor(power_value * 255 / 100);
                    }
                    cmds.push(key + value);
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

    // process "multi-pass"
    gcodeStr = processGcodeMultiPass(gcodeStr, settings);

    return gcodeStr;
};

const processGcodeMultiPass = (gcodeStr, settings) => {
    const {multi_pass} = settings.working_parameters.children;
    const {passes, pass_depth} = multi_pass.children;
    if (multi_pass.default_value) {
        let result = '';
        for (let i = 0; i < passes.default_value; i++) {
            result += `; Laser multi-pass, pass ${i + 1} with Z = ${-i * pass_depth.default_value}\n`;
            // dropping z
            if (i !== 0) {
                result += '; Laser multi-pass: dropping z\n';
                result += 'G91\n'; // relative positioning
                result += `G0 Z-${pass_depth.default_value} F150\n`;
                result += 'G90\n'; // absolute positioning
            }
            result += gcodeStr + '\n';
        }
        // move back to work origin
        result += 'G0 Z0\n';
        gcodeStr = result;
    }
    return gcodeStr;
};

export default toolPathLines2gcode;
