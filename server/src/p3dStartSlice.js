import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import {CURA_ENGINE_PATH, CACHE_DIR, P3D_CONFIG_SETTING_DIR} from './init.js';

const preHandle = (data) => {
    // stlUrl: http://localhost:9000/cache/1591695065752.stl
    const {stlUrl, materialName, settingName} = data;
    const materialPath = path.join(P3D_CONFIG_SETTING_DIR, `material_${materialName}.def.json`);
    const settingPath = path.join(P3D_CONFIG_SETTING_DIR, `setting_${settingName}.def.json`);

    const activatedMaterialPath = path.join(P3D_CONFIG_SETTING_DIR, `activated_material.def.json`);
    const activatedSettingPath = path.join(P3D_CONFIG_SETTING_DIR, `activated_setting.def.json`);

    fs.existsSync(materialPath) && fs.writeFileSync(activatedMaterialPath, fs.readFileSync(materialPath));
    fs.existsSync(settingPath) && fs.writeFileSync(activatedSettingPath, fs.readFileSync(settingPath));

    const items = stlUrl.split("/");
    const modelName = items[items.length - 1];
    const modelPath = path.join(CACHE_DIR, modelName);

    const d = new Date();
    const gcodeName = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join("") + ".gcode";
    const gcodePath = path.join(CACHE_DIR, gcodeName);

    return {activatedSettingPath, modelPath, gcodePath, gcodeName}
};

const callCuraEngine = (modelPath, activatedSettingPath, gcodePath) => {
    return childProcess.spawn(
        CURA_ENGINE_PATH,
        ['slice', '-v', '-p', '-j', activatedSettingPath, '-o', gcodePath, '-l', modelPath]
    );
};

const p3dStartSlice = (data, onProgress, onSucceed, onError) => {
    let progress, filamentLength, filamentWeight, printTime;

    const {activatedSettingPath, modelPath, gcodePath, gcodeName} = preHandle(data);

    if (!fs.existsSync(CURA_ENGINE_PATH)) {
        onError(`Slice Error: Cura Engine not exist -> ${CURA_ENGINE_PATH}`);
        return;
    }
    if (!fs.existsSync(activatedSettingPath)) {
        onError(`Slice Error: file not exist ->  ${activatedSettingPath}`);
        return;
    }
    if (!fs.existsSync(modelPath)) {
        onError(`Slice Error: file not exist -> ${modelPath}`);
        return;
    }

    const process = callCuraEngine(modelPath, activatedSettingPath, gcodePath);

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
                gcodeName,
                printTime,
                filamentLength,
                filamentWeight,
                gcodePath
            });
        }
        console.log('slice progress closed with code ' + code);
    });
};

export default p3dStartSlice;
