import events from "events";
import socketClientManager from "../../../socket/socketClientManager";
import {P3D_MATERIAL_FETCH_ALL, P3D_MATERIAL_UPDATE, P3D_MATERIAL_DELETE, P3D_MATERIAL_CLONE} from "../../../constants";
import _ from 'lodash';

/**
 * 管理p3d printing material
 */
class P3DMaterialManager extends events.EventEmitter {
    constructor() {
        super();
        this.name = null; //选中的material的name
        this.materials = []; //所有material

        socketClientManager.on("socket", (status) => {
            if (status === "connect") {
                this.fetchAll();
            } else if (status === "disconnect") {
                this.name = null;
                this.materials = [];
                this.emit("onSelectedChange", this.name);
                this.emit("onMaterialsChange", this.materials);
            }
        });

        socketClientManager.on(P3D_MATERIAL_FETCH_ALL, (materials) => {
            this.materials = materials;
            //TODO: 判断是否有变化，有变化才emit
            this.emit("onMaterialsChange", this.materials);
            if (!this._containName(this.name)){
                this.name = this._getAvailableOfficialName();
                this.emit("onSelectedChange", this.name);
            }
        });
    }

    fetchAll() {
        socketClientManager.p3dMaterialFetchAll();
    }

    /**
     *
     * @param key 例子: overrides.material_flow.default_value 或 name
     * @param value
     */
    update(key, value) {
        const keys = key.split('.');
        if (keys.length !== 3) {
            console.error("keys.length !== 3");
            return;
        }

        const material = this._getByName(this.name);
        if (!material) {
            console.error("material is null");
            return;
        }

        //更新内存
        material[keys[0]][keys[1]][keys[2]] = value;
        //更新server
        socketClientManager.p3dMaterialUpdate(this.name, key, value);
    }

    rename(newName) {
        // this.update("name", newName)
    }

    delete() {
        // const name = this.name;
        // //更新内存
        // const index = this.materials.indexOf(this.name);
        // this.materials.splice(index, 1);
        // this._selected = this.materials[0];
        // this.emit("onSelectedChange", this._selected);
        // //更新server
        // socketClientManager.p3dMaterialDelete(name);
    }

    clone() {
        // const sourceName = this._selected.name;
        // const targetName = "#" + this._selected.name;
        // //更新内存
        // const clone = _.cloneDeep(this._selected);
        // clone.name = targetName;
        // this.materials.push(clone);
        // this._selected = clone;
        // this.emit("onSelectedChange", this._selected);
        // //更新server
        // socketClientManager.p3dMaterialClone(sourceName, targetName);
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

    //从materials中找出一个isOfficial=true的
    _getAvailableOfficialName() {
        for (let i = 0; i < this.materials.length; i++) {
            const item = this.materials[i];
            if (item.isOfficial) {
                return item.name;
            }
        }
        return null;
    }

    _getByName(name) {
        for (let i = 0; i < this.materials.length; i++) {
            const item = this.materials[i];
            if (item.name === name) {
                return item;
            }
        }
        return null;
    }

    _containName = (name) => {
        for (let i = 0; i < this.materials.length; i++) {
            const item = this.materials[i];
            if (item.name === name) {
                return true;
            }
        }
        return false;
    };
}

const p3dMaterialManager = new P3DMaterialManager();

export default p3dMaterialManager;
