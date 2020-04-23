import events from "events";
import {uploadImage} from '../api/index.js';
import Model2D from "./Model2D";

class LaserManager extends events.EventEmitter {
    constructor() {
        super();
        this.modelsParent = null;
        //modelsParent的children可能不止包含models
        //因此需要models记录
        this.models = [];

        this._selected = null;
    }

    //设置模型要展示在哪个object3d上
    setModelsParent(object3d) {
        this.modelsParent = object3d;
    }

    //selected model的状态有改变: x, y, rotation, width, height; 切换selected model
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

    /**
     * 加载模型
     * 异步
     * 成功后，得到texture mesh，展示在modelsParent上
     */
    async loadModel(fileType, file) {
        const response = await this._uploadImage(file);
        const {url, width, height} = response;
        const model2D = new Model2D(fileType);
        model2D.loadImage(url, width, height);

        this.modelsParent.add(model2D);

        this.selectModel(model2D)
    }

    loadText(text) {

    }

    //使用id？
    removeModel(model) {

    }

    selectModel(model) {
        console.log("111")
        if (this._selected === model) {
            return;
        }
        this._selected = model;

        console.log("222")
        for (const child of this.modelsParent.children) {
            model.setSelected(this._selected === child);
        }

        this._emmitChangeEvent();
    }

    //生成gcode并展示在modelsParent中，替换之前的展示内容
    previewGcode(model) {

    }

    //改变transformation
    setWidth(value) {
        console.log("setWidth: " + value)
        if (!this._selected) {
            return;
        }
        this._selected.setWidth(value)
        this.emit('onChange', this._selected);
        ;
    }

    setHeight(value) {
        if (!this._selected) {
            return;
        }
        this._selected.setHeight(value);
        this.emit('onChange', this._selected);
        ;
    }

    //angle
    setRotation(value) {
        if (!this._selected) {
            return;
        }
        this._selected.setRotation(value);
        this.emit('onChange', this._selected);
        ;
    }

    setX(value) {
        if (!this._selected) {
            return;
        }
        this._selected.setX(value);
        this.emit('onChange', this._selected);
        ;

    }

    setY(value) {
        if (!this._selected) {
            return;
        }
        this._selected.setY(value);
        this.emit('onChange', this._selected);
        ;
    }


}

const laserManager = new LaserManager();

export default laserManager;
