const toolPathLines2gcode = (toolPathLines, settings) => {
    console.log(JSON.stringify(settings, null, 2));
    console.log(JSON.stringify(toolPathLines, null, 2));

    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;

    const {x, y} = settings.transformation.children;
    const translateX = x.default_value;
    const translateY = y.default_value;

    const gcodeLines = [];
    const header = [
        '; Write And Draw',
        'M888 P0',
        'G0 Z10',
        'G1 Z10',
    ];

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
                case 'M':
                    if (value === 3) {
                        cmds.push('G1 Z0.00')
                    } else if (value === 5) {
                        cmds.push('G0 Z10.00')
                    }
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

    return header.join('\n') + '\n' + gcodeLines.join('\n') + '\n';
};
export default toolPathLines2gcode;
