import events from "events";
import {uploadImage, uploadFile} from '../api/index.js';
import Model2D from "./Model2D";
import socketManager from "../socket/socketManager"

class LaserManager extends events.EventEmitter {
    constructor() {
        super();
        this.modelsParent = null;
        this._selected = null;
    }

    //设置模型要展示在哪个object3d上
    setModelsParent(object3d) {
        this.modelsParent = object3d;
    }

    //selected model的状态有改变: x, y, rotation, width, height; 切换selected model
    //应该分4种event：transform change，model change，config change，working parameters change
    _emmitChangeEvent() {
        this.emit('onChange', this._selected);
    }

    async _uploadImage(file) {
        try {
            const response = await uploadImage(file);
            return response;
        } catch (e) {
            console.log("_uploadImage err: " + JSON.stringify(e))
            return e;
        }
    }

    async _uploadFile(file) {
        try {
            const response = await uploadFile(file);
            return response;
        } catch (e) {
            console.log("_uploadFile err: " + JSON.stringify(e))
            return e;
        }
    }

    /**
     * 加载模型
     * 异步
     * 成功后，得到texture mesh，展示在modelsParent上
     */
    async loadModel(fileType, file) {
        if (fileType === "text") {

        } else {
            const response = await this._uploadImage(file);
            const {url, width, height} = response;

            const model2D = new Model2D(fileType);
            model2D.loadImage(url, width, height);
            this.modelsParent.add(model2D);
            this.selectModel(model2D)
        }
    }

    loadText(text) {

    }

    selectModel(model) {
        if (this._selected === model) {
            return;
        }
        this._selected = model;
        for (const child of this.modelsParent.children) {
            model.setSelected(this._selected === child);
        }
        this._emmitChangeEvent();
    }

    removeSelected() {
        if (this._selected) {
            this.modelsParent.remove(this._selected)
            this._selected = null;
            this._emmitChangeEvent();
        }
    }

    updateTransformation(key, value) {
        console.log(key + "-->" + value)
        this._selected.updateTransformation(key, value);
        this._emmitChangeEvent();
    }

    updateConfig(key, value) {
        this._selected.updateConfig(key, value);
        this._emmitChangeEvent();
    }

    updateWorkingParameters(key, value) {
        this._selected.updateWorkingParameters(key, value);
        this._emmitChangeEvent();
    }

    //text模型独有
    updateConfigText(key, value) {
        this._selected.updateConfigText(key, value);
        this._emmitChangeEvent();
    }
}

const laserManager = new LaserManager();

export default laserManager;
