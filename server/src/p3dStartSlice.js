import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import getCWD from "./getCWD.js";

const cwd = getCWD();

let curaEnginePath;
// Determine path of Cura Engine
(() => {
    switch (process.platform) {
        case 'darwin':
            curaEnginePath = path.join(cwd, '/CuraEngine/2.7/macOS/CuraEngine');
            break;
        case 'win32':
            curaEnginePath = path.join(cwd, '/CuraEngine/2.7/Win-x64/CuraEngine.exe');
            break;
        case 'linux':
            curaEnginePath = path.join(cwd, '/CuraEngine/2.7/Linux-x64/CuraEngine');
            break;
    }
    if (fs.existsSync(curaEnginePath)) {
        console.log(`Cura Engine exist: ${curaEnginePath}`);
    } else {
        console.error(`Cura Engine not found: ${curaEnginePath}`);
    }
})();

function copyFile(src, dist) {
    fs.writeFileSync(dist, fs.readFileSync(src));
}

const preHandle = (data) => {
    // stlUrl: http://localhost:9000/cache/1591695065752.stl
    const {stlUrl, materialName, settingName} = data;
    const materialFilePath = path.join(cwd, `/CuraEngine/Config/material_${materialName}.def.json`);
    const settingFilePath = path.join(cwd, `/CuraEngine/Config/setting_${settingName}.def.json`);

    if (!fs.existsSync(materialFilePath)) {
        onError(`Slice Error: material config not found: ${materialFilePath}`);
        return null;
    }
    if (!fs.existsSync(settingFilePath)) {
        onError(`Slice Error: setting config not found: ${settingFilePath}`);
        return null;
    }

    const activatedMaterialFilePath = path.join(cwd, `/CuraEngine/Config/activated_material.def.json`);
    const activatedSettingFilePath = path.join(cwd, `/CuraEngine/Config/activated_setting.def.json`);

    copyFile(materialFilePath, activatedMaterialFilePath);
    copyFile(settingFilePath, activatedSettingFilePath);

    const items = stlUrl.split("/");
    const modelFileName = items[items.length - 1];
    const modelPath = path.join(cwd, `/static/cache/${modelFileName}`);

    const date = new Date();
    const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    const gcodeFileName = arr.join("") + ".gcode";
    const gcodeFilePath = path.join(cwd, `/static/cache/${gcodeFileName}`);

    return {configFilePath: activatedSettingFilePath, modelPath, gcodeFilePath, gcodeFileName}

};

const callCuraEngine = (modelPath, configName, outputPath) => {
    const configPath = configName;
    return childProcess.spawn(
        curaEnginePath,
        ['slice', '-v', '-p', '-j', configPath, '-o', outputPath, '-l', modelPath]
    );
};

const p3dStartSlice = (data, onProgress, onSucceed, onError) => {
    let progress, filamentLength, filamentWeight, printTime;

    if (!fs.existsSync(curaEnginePath)) {
        onError(`Slice Error: Cura Engine not found: ${curaEnginePath}`);
        return;
    }

    const {modelPath, configFilePath, gcodeFilePath, gcodeFileName} = preHandle(data);

    if (!fs.existsSync(modelPath)) {
        onError('Slice Error: stl file not exist -> ' + modelPath);
        return;
    }

    if (!fs.existsSync(configFilePath)) {
        onError('Slice Error: config file not exist -> ' + configFilePath);
        return;
    }

    const process = callCuraEngine(modelPath, configFilePath, gcodeFilePath);

    process.stderr.on('data', (data) => {
        let array = data.toString().split('\n');
        array.map((item) => {
            if (item.length < 10) {
                return null;
            }
            if (item.indexOf('Progress:inset+skin:') === 0 || item.indexOf('Progress:export:') === 0) {
                let start = item.indexOf('0.');
                let end = item.indexOf('%');
                progress = Number(item.slice(start, end));
                onProgress(progress);
            } else if (item.indexOf(';Filament used:') === 0) {
                filamentLength = Number(item.replace(';Filament used:', '').replace('m', ''));
                filamentWeight = Math.PI * (1.75 / 2) * (1.75 / 2) * filamentLength * 1.24;
            } else if (item.indexOf('Print time:') === 0) {
                // add empirical parameter : 1.07
                printTime = Number(item.replace('Print time:', '')) * 1.07;
            }
            return null;
        });
    });

    process.on('close', (code) => {
        if (filamentLength && filamentWeight && printTime) {
            onProgress(1);
            onSucceed({
                gcodeFileName,
                printTime,
                filamentLength,
                filamentWeight,
                gcodeFilePath
            });
        }
        console.log('slice progress closed with code ' + code);
    });
};

export default p3dStartSlice;
