import events from "events";

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
            child.setSelected(this._selected === child);
        }
        this._emmitChangeEvent();
    }

    removeSelected() {
        if (this._selected) {
            this.modelsParent.remove(this._selected);
            this._selected = null;
            this._emmitChangeEvent();
        }
    }

    duplicateSelected() {
        if (this._selected) {
            const model2D = this._selected.clone();
            this.addModel2D(model2D)
        }
    }

    removeAll() {
        this.modelsParent.remove(...this.modelsParent.children);
        this._selected = null;
        this._emmitChangeEvent();
    }

    /**
     *
     * @param key
     * @param value
     * @param preview 是否触发model2d preview
     */
    updateTransformation(key, value, preview = true) {
        this._selected.updateTransformation(key, value, preview);
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
}

const laserManager = new LaserManager();

export default laserManager;
