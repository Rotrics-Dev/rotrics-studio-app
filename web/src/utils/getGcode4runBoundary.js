const computeBoundary = (toolPathLines, settings) => {
    const min = Number.MIN_VALUE;
    const max = Number.MAX_VALUE;
    let minX = max, minY = max;
    let maxX = min, maxY = min;

    for (let i = 0; i < toolPathLines.length; i++) {
        const line = toolPathLines[i];
        if (line.X !== undefined) {
            minX = Math.min(line.X, minX);
            maxX = Math.max(line.X, maxX);
        }
        if (line.Y !== undefined) {
            minY = Math.min(line.Y, minY);
            maxY = Math.max(line.Y, maxY);
        }
    }

    const {x, y} = settings.transformation.children;
    const translateX = x.default_value;
    const translateY = y.default_value;
    minX += translateX;
    maxX += translateX;
    minY += translateY;
    maxY += translateY;
    return {minX, maxX, minY, maxY};
};

/**
 * 所有模型都preview后才能调用
 * @returns {string}
 */
const getGcode4runBoundary = (models) => {
    const min = -Number.MAX_VALUE;
    const max = Number.MAX_VALUE;
    let _minX = max, _minY = max;
    let _maxX = min, _maxY = min;
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const {toolPathLines, settings} = model;
        const {minX, maxX, minY, maxY} = computeBoundary(toolPathLines, settings);
        _minX = Math.min(minX, _minX);
        _maxX = Math.max(maxX, _maxX);
        _minY = Math.min(minY, _minY);
        _maxY = Math.max(maxY, _maxY);
    }
    const p1 = {x: _minX.toFixed(1), y: _minY.toFixed(1)};
    const p2 = {x: _maxX.toFixed(1), y: _minY.toFixed(1)};
    const p3 = {x: _maxX.toFixed(1), y: _maxY.toFixed(1)};
    const p4 = {x: _minX.toFixed(1), y: _maxY.toFixed(1)};
    const gcodeArr = [];
    const height = 10;
    gcodeArr.push("M2000");
    gcodeArr.push("G0 F4000");
    gcodeArr.push("G91");
    gcodeArr.push(`G0 Z${height}`);
    gcodeArr.push("G90");
    gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
    gcodeArr.push(`G0 X${p2.x} Y${p2.y}`);
    gcodeArr.push(`G0 X${p3.x} Y${p3.y}`);
    gcodeArr.push(`G0 X${p4.x} Y${p4.y}`);
    gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
    gcodeArr.push("G91");
    gcodeArr.push(`G0 Z${-height}`);
    gcodeArr.push("G90");

    console.log(
        gcodeArr.join('\n')
    )
    return gcodeArr.join('\n');
};

export default getGcode4runBoundary;
