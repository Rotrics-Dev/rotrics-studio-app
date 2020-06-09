import events from "events";
import socketClientManager from "../../../socket/socketClientManager";
import {P3D_SETTING_FETCH_ALL} from "../../../constants";
import _ from 'lodash';

class P3DSettingManager extends events.EventEmitter {
    constructor() {
        super();
        this.name = null; //选中的setting的name
        this.settings = []; //所有setting

        socketClientManager.on("socket", (status) => {
            if (status === "connect") {
                this.fetchAll();
            } else if (status === "disconnect") {
                this.name = null;
                this.settings = [];
                this.emit("onSelectedChange", this.name);
                this.emit("onSettingsChange", this.settings);
            }
        });

        socketClientManager.on(P3D_SETTING_FETCH_ALL, (settings) => {
            this.settings = settings;
            //TODO: 判断是否有变化，有变化才emit
            this.emit("onSettingsChange", this.settings);
            if (!this._containName(this.name)) {
                this.name = this._getAvailableOfficialName();
                this.emit("onSelectedChange", this.name);
            }
        });
    }

    fetchAll() {
        socketClientManager.p3dSettingFetchAll();
    }

    /**
     *
     * @param key 例子: overrides.layer_height.default_value 或 name
     * @param value
     */
    update(key, value) {
        const keys = key.split('.');
        if (keys.length !== 3) {
            console.error("keys.length !== 3");
            return;
        }

        const setting = this._getByName(this.name);
        if (!setting) {
            console.error("setting is null");
            return;
        }

        //更新内存
        setting[keys[0]][keys[1]][keys[2]] = value;
        //更新server
        socketClientManager.p3dSettingUpdate(this.name, key, value);
    }

    rename(newName) {
    }

    delete() {
    }

    clone() {
    }

    select(name) {
        if (!this._containName(name)) {
            console.error("name is not contained");
            return;
        }

        if (this.name !== name) {
            this.name = name;
            this.emit("onSelectedChange", this.name);
        }
    }

    _getAvailableOfficialName() {
        for (let i = 0; i < this.settings.length; i++) {
            const item = this.settings[i];
            if (item.isOfficial) {
                return item.name;
            }
        }
        return null;
    }

    _getByName(name) {
        for (let i = 0; i < this.settings.length; i++) {
            const item = this.settings[i];
            if (item.name === name) {
                return item;
            }
        }
        return null;
    }

    _containName = (name) => {
        for (let i = 0; i < this.settings.length; i++) {
            const item = this.settings[i];
            if (item.name === name) {
                return true;
            }
        }
        return false;
    };
}

const p3dSettingManager = new P3DSettingManager();

export default p3dSettingManager;
