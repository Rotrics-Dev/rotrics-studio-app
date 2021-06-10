import fs from 'fs';
import path from 'path';
import isElectron from 'is-electron';
import electron from 'electron';

class StoreManager {
    constructor() {
        //user data
        this.dir_user_data = null;
        this.dir_code_projects_my = null;

        //software data: 随着软件更新而全部改变
        this.dir_code_projects_example = path.join(__dirname, '..', 'static', 'code', 'example_projects');;
        this.path_p3d_cura_engine = null;

        if (isElectron()) {
            this.dir_user_data = (electron.app || electron.remote.app).getPath('userData');
        } else {
            this.dir_user_data = path.join(__dirname, '..', 'static');
        }

        const curaEngineBasePath = path.join(__dirname, '..', 'CuraEngine', '4.6.2');
        switch (process.platform) {
            case 'darwin':
                this.path_p3d_cura_engine = path.join(curaEngineBasePath, 'macOS', 'CuraEngine');
                break;
            case 'win32':
                this.path_p3d_cura_engine = path.join(curaEngineBasePath, 'Win-x64', 'CuraEngine.exe');
                break;
            case 'linux':
                this.path_p3d_cura_engine = path.join(curaEngineBasePath, 'Linux-x64', 'CuraEngine');
                break;
        }

        this.dir_code_projects_my = path.join(this.dir_user_data, 'code', 'my_projects');

        fs.mkdirSync(this.dir_code_projects_my, {recursive: true});
        fs.mkdirSync(this.dir_code_projects_example, {recursive: true});
    }
}

const storeManager = new StoreManager();

export default storeManager;
