const TOKEN_COMMENT = 'C';
const TOKEN_EMPTY_LINE = 'N';

/**
 * tool path：将string转为obj line array；保留所有信息，包括comment，空行
 *
 * tool path str
 * G0 X1 Y2 Z3 ;this is comment
 * G1 X10 Y20 Z30
 *
 * toolPathLines:
 * [
 *   { G: 0, X: 1, Y: 2, Z: 3, C: ";this is comment" },
 *   { G: 1, X: 10, Y: 20, Z: 30 }
 * ]
 *
 * @param toolPathStr:
 * @returns {Array}
 */
const toolPathStr2toolPathLines = (toolPathStr) => {
    const objLines = [];
    const strLines = toolPathStr.split('\n');
    for (let i = 0; i < strLines.length; i++) {
        //替换所有多个空格为一个空格
        const strLine = strLines[i].trim().replace(/\s+/g, " ");
        //空行
        if (strLine.length === 0) {
            objLines.push({[TOKEN_EMPTY_LINE]: ""}); //{N: ""}
            continue;
        }
        const objLine = {}; //{G: 0, X: 0, Y: 0}
        let comment = null;
        let cmdData = null;

        //string.split(";")不可用，comment中也可能包含";"
        const commentIndex = strLine.indexOf(';');
        if (commentIndex !== -1) {
            cmdData = strLine.substring(0, commentIndex);
            comment = strLine.substring(commentIndex);
        } else {
            cmdData = strLine;
        }

        comment && (objLine[TOKEN_COMMENT] = comment);
        if (cmdData) {
            const tokens = cmdData.trim().split(' ');
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                const cmdType = token.substring(0, 1);
                let value = parseFloat(token.substring(1, token.length));

                //value可能不是数字而是string，例如: G0 F#jog_speed#
                if (Number.isNaN(value)) {
                    value = token.substring(1, token.length);
                }

                objLine[cmdType] = value;
            }
        }

        objLines.push(objLine);
    }
    return objLines;
};

export default toolPathStr2toolPathLines;
