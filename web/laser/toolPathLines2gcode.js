const toolPathLines2gcode = (toolPathLines, settings) => {
    console.log("## generateGcode4laserBw")
    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;

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

    // process "multi-pass, fix-power"
    gcodeStr = processGcodeMultiPass(gcodeStr, settings);
    gcodeStr = processGcodeForFixedPower(gcodeStr, settings);

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

const processGcodeForFixedPower = (gcodeStr, settings) => {
    const {fixed_power} = settings.working_parameters.children;
    const {power} = fixed_power.children;
    if (fixed_power.default_value) {
        const powerStrength = Math.floor(power.default_value * 255 / 100);
        const fixedPowerGcode = [
            '; Laser: setting power',
            `M3 P${power.default_value} S${powerStrength}`,
            'G4 P1',
            'M5'
        ].join('\n') + '\n\n';
        gcodeStr = fixedPowerGcode + gcodeStr;
    }
    return gcodeStr;
};

export default toolPathLines2gcode;
