import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import {CURA_ENGINE_PATH, CACHE_DIR, P3D_DIR_CONFIG_SETTING_PRINT, P3D_DIR_CONFIG_SETTING_MATERIAL, P3D_DIR_CONFIG} from './init.js';

const preHandle = (data) => {
    // data: {stlUrl, filenameConfigMaterial, filenameConfigOther, id}
    // stlUrl: http://localhost:9000/cache/1591695065752.stl
    const {stlUrl, filenameConfigMaterial, filenameConfigOther} = data;
    const materialPath = path.join(P3D_DIR_CONFIG_SETTING_MATERIAL, filenameConfigMaterial);
    const settingPath = path.join(P3D_DIR_CONFIG_SETTING_PRINT, filenameConfigOther);

    const configFilename = "fdmprinter.def.json";
    const configPath = path.join(P3D_DIR_CONFIG, configFilename);

    const contentMaterial = JSON.parse(fs.readFileSync(materialPath, 'utf8'));
    const contentSetting = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
    contentSetting.settings.material = contentMaterial.material;

    if (!fs.existsSync(materialPath)) {
        console.log("materialPath not exist")
    }
    if (!fs.existsSync(settingPath)) {
        console.log("settingPath not exist")
    }

    fs.existsSync(materialPath) && fs.existsSync(settingPath) && fs.writeFileSync(configPath, JSON.stringify(contentSetting, null, 2));

    const items = stlUrl.split("/");
    const modelName = items[items.length - 1];
    const modelPath = path.join(CACHE_DIR, modelName);

    const d = new Date();
    const gcodeName = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join("") + ".gcode";
    const gcodePath = path.join(CACHE_DIR, gcodeName);

    return {configPath, modelPath, gcodePath, gcodeName}
};

const callCuraEngine = (modelPath, activatedSettingPath, gcodePath) => {
    return childProcess.spawn(
        CURA_ENGINE_PATH,
        ['slice', '-v', '-p', '-j', activatedSettingPath, '-o', gcodePath, '-l', modelPath]
    );
};

const p3dStartSlice = (data, onProgress, onSucceed, onError) => {
    let progress, filamentLength, filamentWeight, printTime;

    const {configPath, modelPath, gcodePath, gcodeName} = preHandle(data);

    if (!fs.existsSync(CURA_ENGINE_PATH)) {
        onError(`Slice Error: Cura Engine not exist -> ${CURA_ENGINE_PATH}`);
        return;
    }
    if (!fs.existsSync(configPath)) {
        onError(`Slice Error: file not exist ->  ${configPath}`);
        return;
    }
    if (!fs.existsSync(modelPath)) {
        onError(`Slice Error: file not exist -> ${modelPath}`);
        return;
    }

    const process = callCuraEngine(modelPath, configPath, gcodePath);

    process.stderr.on('data', (data) => {
        // console.log(data.toString())
        let array = data.toString().split('\n');

        array.map((item) => {
            console.log("### " + item)
            if (item.length < 10) {
                return null;
            }
            if (item.indexOf('Progress:inset+skin:') === 0 || item.indexOf('Progress:export:') === 0) {
                let start = item.indexOf('0.');
                let end = item.indexOf('%');
                progress = Number(item.slice(start, end));
                onProgress(progress);
            } else if (item.indexOf(';Filament used: ') === 0) {
                filamentLength = Number(item.replace(';Filament used: ', '').replace('m', ''));
                filamentWeight = Math.PI * (1.75 / 2) * (1.75 / 2) * filamentLength * 1.24;
            } else if (item.indexOf('Print time (s):') === 0) {
                // add empirical parameter : 1.07
                console.log("printTime: " + printTime)
                printTime = Number(item.replace('Print time (s):', '').trim()) * 1.07;
            }
            return null;
        });
    });

    process.on('close', (code) => {
        console.log(filamentLength, filamentWeight, printTime)
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
