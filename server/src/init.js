import fs from 'fs';
import path from 'path';

let CURA_ENGINE_PATH;
const curaEngineBasePath = path.join(__dirname, '..', 'CuraEngine', '2.7');
const STATIC_DIR = path.join(__dirname, '..', 'static');
const CACHE_DIR = path.join(__dirname, '..', 'static', 'cache');
const P3D_CONFIG_DIR = path.join(__dirname, '..', 'CuraEngine', 'Config');

(() => {
    switch (process.platform) {
        case 'darwin':
            CURA_ENGINE_PATH = path.join(curaEngineBasePath, 'macOS', 'CuraEngine');
            break;
        case 'win32':
            CURA_ENGINE_PATH = path.join(curaEngineBasePath, 'Win-x64', 'CuraEngine.exe');
            break;
        case 'linux':
            CURA_ENGINE_PATH = path.join(curaEngineBasePath, 'Linux-x64', 'CuraEngine');
            break;
    }
    if (!fs.existsSync(CURA_ENGINE_PATH)) {
        console.error(`Cura Engine not found: ${CURA_ENGINE_PATH}`);
    }
})();

export {CURA_ENGINE_PATH, STATIC_DIR, CACHE_DIR, P3D_CONFIG_DIR};
