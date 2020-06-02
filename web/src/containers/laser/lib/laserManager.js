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

    addModel(model2d) {
        this.modelsParent.add(model2d);
        this.selectModel(model2d);
        this.emit('onChangeModel', this._selected);
    }

    selectModel(model) {
        if (this._selected === model) {
            return;
        }
        this._selected = model;
        for (const child of this.modelsParent.children) {
            child.setSelected(this._selected === child);
        }
        this.emit('onChangeModel', this._selected);
    }

    removeSelected() {
        if (this._selected) {
            this.modelsParent.remove(this._selected);
            this._selected = null;
            this._emmitChangeEvent();
        }
        this.emit('onChangeModel', this._selected);
    }

    removeAll() {
        this.modelsParent.remove(...this.modelsParent.children);
        this._selected = null;
        this.emit('onChangeModel', this._selected);
    }

    duplicateSelected() {
        if (this._selected) {
            const model2D = this._selected.clone();
            this.addModel2D(model2D)
        }
    }

    /**
     * @param key
     * @param value
     * @param preview 是否触发model2d preview
     */
    updateTransformation(key, value, preview = true) {
        //todo: 根据updateTransformation返回值，来确定是否需要emmit
        this._selected.updateTransformation(key, value, preview);
        this.emit('onChangeTransformation', this._selected.settings.transformation);
    }

    updateConfig(key, value) {
        this._selected.updateConfig(key, value);
        this.emit('onChangeConfig', this._selected.settings.config);
    }

    updateWorkingParameters(key, value) {
        this._selected.updateWorkingParameters(key, value);
        this.emit('onChangeWorkingParameters', this._selected.settings.working_parameters);
    }
}

const laserManager = new LaserManager();

export default laserManager;
