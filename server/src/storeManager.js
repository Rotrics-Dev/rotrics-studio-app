import fs from 'fs';
import path from 'path';
import electron from 'electron';
import isElectron from 'is-electron';

const DEFAULT_CONFIG = {
    is_show_tip: true
};

class StoreManager {
    constructor() {
        //  example project content will change when app upgrade
        this.dir_code_projects_example = path.join(__dirname, '..', 'static', 'code', 'example_projects');

        this.dir_user_data = null;
        this.dir_code_projects_my = null;
        this.path_app_config = null;
        this.path_p3d_cura_engine = null;

        const platform = process.platform;
        if (isElectron()) {
            this.dir_user_data = (electron.app || electron.remote.app).getPath('userData');
            this.dir_code_projects_my = path.join(this.dir_user_data, 'code', 'my_projects');
            this.path_app_config = path.join(this.dir_user_data, 'app_config.json');
            switch (platform) {
                case 'darwin':
                    this.path_p3d_cura_engine = path.join(this.dir_user_data, 'CuraEngine', '4.6.2', 'macOS', 'CuraEngine');
                    break;
                case 'win32':
                    this.path_p3d_cura_engine = path.join(this.dir_user_data, 'CuraEngine', '4.6.2', 'Win-x64', 'CuraEngine.exe');
                    break;
                case 'linux':
                    this.path_p3d_cura_engine = path.join(this.dir_user_data, 'CuraEngine', '4.6.2', 'Linux-x64', 'CuraEngine');
                    break;
            }
            //TODO: copy CuraEngine to dir_user_data
        } else {
            this.dir_user_data = path.join(__dirname, '..', 'static');
            this.dir_code_projects_my = path.join(this.dir_user_data, 'code', 'my_projects');
            this.path_app_config = path.join(this.dir_user_data, 'app_config.json');
            const base_path = path.join(__dirname, '..', 'CuraEngine', '4.6.2');
            switch (platform) {
                case 'darwin':
                    this.path_p3d_cura_engine = path.join(base_path, 'macOS', 'CuraEngine');
                    break;
                case 'win32':
                    this.path_p3d_cura_engine = path.join(base_path, 'Win-x64', 'CuraEngine.exe');
                    break;
                case 'linux':
                    this.path_p3d_cura_engine = path.join(base_path, 'Linux-x64', 'CuraEngine');
                    break;
            }
        }

        fs.mkdirSync(this.dir_code_projects_example, {recursive: true});
        fs.mkdirSync(this.dir_code_projects_my, {recursive: true});

        // console.log('-------------------------------')
        // console.log(this.dir_code_projects_example);
        // console.log(this.dir_user_data);
        // console.log(this.dir_code_projects_my);
        // console.log(this.path_app_config);
        // console.log(this.path_p3d_cura_engine);

        this._setupDefaultAppConfig();
    }

    _setupDefaultAppConfig() {
        if (!fs.existsSync(this.path_app_config)) {
            fs.writeFileSync(this.path_app_config, JSON.stringify(DEFAULT_CONFIG));
        } else {
            const config = this.getAllAppConfig();
            if (!config) {
                fs.writeFileSync(this.path_app_config, JSON.stringify(DEFAULT_CONFIG));
            }
        }
    }

    setAppConfig(key, value) {
        const content = JSON.parse(fs.readFileSync(this.path_app_config, 'utf8'));
        content[key] = value;
        fs.writeFileSync(this.path_app_config, JSON.stringify(content));
    }

    getAllAppConfig() {
        return JSON.parse(fs.readFileSync(this.path_app_config, 'utf8'));
    }
}

const storeManager = new StoreManager();

export default storeManager;
