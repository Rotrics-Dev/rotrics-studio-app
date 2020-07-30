import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import {CURA_ENGINE_PATH, CACHE_DIR, P3D_CONFIG_DIR} from './init.js';

const copyFileSync = (src, dist) => {
    fs.writeFileSync(dist, fs.readFileSync(src));
};

const preHandle = (data) => {
    // stlUrl: http://localhost:9000/cache/1591695065752.stl
    const {stlUrl, materialName, settingName} = data;
    const materialFilePath = path.join(P3D_CONFIG_DIR, `material_${materialName}.def.json`);
    const settingFilePath = path.join(P3D_CONFIG_DIR, `setting_${settingName}.def.json`);

    if (!fs.existsSync(materialFilePath)) {
        onError(`Slice Error: material config not found: ${materialFilePath}`);
        return null;
    }
    if (!fs.existsSync(settingFilePath)) {
        onError(`Slice Error: setting config not found: ${settingFilePath}`);
        return null;
    }

    const activatedMaterialFilePath = path.join(P3D_CONFIG_DIR, `activated_material.def.json`);
    const activatedSettingFilePath = path.join(P3D_CONFIG_DIR, `activated_setting.def.json`);

    copyFileSync(materialFilePath, activatedMaterialFilePath);
    copyFileSync(settingFilePath, activatedSettingFilePath);

    const items = stlUrl.split("/");
    const modelFileName = items[items.length - 1];
    const modelPath = path.join(CACHE_DIR, modelFileName);

    const date = new Date();
    const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    const gcodeFileName = arr.join("") + ".gcode";
    const gcodeFilePath = path.join(CACHE_DIR, gcodeFileName);

    return {configFilePath: activatedSettingFilePath, modelPath, gcodeFilePath, gcodeFileName}
};

const callCuraEngine = (modelPath, configName, outputPath) => {
    const configPath = configName;
    return childProcess.spawn(
        CURA_ENGINE_PATH,
        ['slice', '-v', '-p', '-j', configPath, '-o', outputPath, '-l', modelPath]
    );
};

const p3dStartSlice = (data, onProgress, onSucceed, onError) => {
    let progress, filamentLength, filamentWeight, printTime;

    if (!fs.existsSync(CURA_ENGINE_PATH)) {
        onError(`Slice Error: Cura Engine not found: ${CURA_ENGINE_PATH}`);
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
