import events from "events";
import Model2D from "./Model2D";
import socketManager from "../socket/socketManager"
import {text2svg} from "../api/index";

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

    /**
     * 加载模型
     * 异步
     * 成功后，得到texture mesh，展示在modelsParent上
     */
    // async addModel2D(model2D) {
    //     if (fileType === "text") {
    //         const text = "Hex Bot";
    //         const attributes = {fill: 'red', stroke: 'black'};
    //         const options = {x: 0, y: 0, fontSize: 40, anchor: 'top', attributes: attributes};
    //
    //         const response = await text2svg(text, options);
    //
    //         const {url, width, height} = response;
    //
    //         console.log(JSON.stringify(response));
    //
    //         const model2D = new Model2D(fileType);
    //         model2D.setImage(url, width, height);
    //         this.modelsParent.add(model2D);
    //         this.selectModel(model2D)
    //     } else {
    //         const response = await this._uploadImage(file);
    //         const {url, width, height} = response;
    //
    //         const model2D = new Model2D(fileType);
    //         model2D.setImage(url, width, height);
    //         this.modelsParent.add(model2D);
    //         this.selectModel(model2D)
    //     }
    // }

    addModel2D(model2D) {
        this.modelsParent.add(model2D);
        this.selectModel(model2D)
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
