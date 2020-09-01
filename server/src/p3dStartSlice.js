import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import {
    CURA_ENGINE_PATH,
    CACHE_DIR,
    P3D_DIR_CONFIG_PRINT_SETTINGS,
    P3D_DIR_CONFIG_MATERIAL_SETTINGS,
    P3D_DIR_CONFIG,
    P3D_FILE_CONFIG_MACHINE_SETTING
} from './init.js';

// data: {stlUrl, materialSettingFilename, printSettingFilename, id}
// stlUrl: http://localhost:9000/cache/1591695065752.stl
const preHandle = (data) => {
    const {stlUrl, materialSettingFilename, printSettingFilename} = data;
    const materialSettingFilePath = path.join(P3D_DIR_CONFIG_MATERIAL_SETTINGS, materialSettingFilename);
    const printSettingFilePath = path.join(P3D_DIR_CONFIG_PRINT_SETTINGS, printSettingFilename);

    const configFilename = "active.def.json";
    const configFilePath = path.join(P3D_DIR_CONFIG, configFilename);

    const contentMaterialSetting = JSON.parse(fs.readFileSync(materialSettingFilePath, 'utf8'));
    const contentPrintSetting = JSON.parse(fs.readFileSync(printSettingFilePath, 'utf8'));
    const contentMachineSetting = JSON.parse(fs.readFileSync(P3D_FILE_CONFIG_MACHINE_SETTING, 'utf8'));

    contentPrintSetting.settings.material = contentMaterialSetting.material;
    contentPrintSetting.settings.machine_settings = contentMachineSetting.machine_settings;

    if (!fs.existsSync(materialSettingFilePath)) {
        console.log("materialSettingFilePath not exist");
        return;
    }
    if (!fs.existsSync(printSettingFilePath)) {
        console.log("printSettingFilePath not exist");
        return;
    }

    fs.writeFileSync(configFilePath, JSON.stringify(contentPrintSetting, null, 2));

    const items = stlUrl.split("/");
    const modelName = items[items.length - 1];
    const modelPath = path.join(CACHE_DIR, modelName);

    const d = new Date();
    const gcodeName = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join("") + ".gcode";
    const gcodePath = path.join(CACHE_DIR, gcodeName);

    return {configPath: configFilePath, modelPath, gcodePath, gcodeName}
};

const callCuraEngine = (modelPath, activatedSettingPath, gcodePath) => {
    return childProcess.spawn(
        CURA_ENGINE_PATH,
        ['slice', '-v', '-p', '-j', activatedSettingPath, '-o', gcodePath, '-l', modelPath]
    );
};

// data: {stlUrl, materialSettingFilename, printSettingFilename, id}
const p3dStartSlice = (data, onProgress, onSucceed, onError) => {
    const {configPath, modelPath, gcodePath, gcodeName} = preHandle(data);
    let progress, filamentLength, filamentWeight, printTime;
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
            } else if (item.indexOf(';Filament used: ') === 0) {
                filamentLength = Number(item.replace(';Filament used: ', '').replace('m', ''));
                filamentWeight = Math.PI * (1.75 / 2) * (1.75 / 2) * filamentLength * 1.24;
            } else if (item.indexOf('Print time (s):') === 0) {
                // add empirical parameter : 1.07
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
