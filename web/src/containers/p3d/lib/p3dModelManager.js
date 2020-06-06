import events from "events";

class P3DModelManager extends events.EventEmitter {
    constructor() {
        super();
        this.modelsParent = null;
        this._selected = null;
    }

    //设置模型要展示在哪个object3d上
    setModelsParent(object3d) {
        this.modelsParent = object3d;
    }

    addModel(model3d) {
        this.modelsParent.add(model3d);
        this.selectModel(model3d);
    }

    selectModel(model3d) {
        if (this._selected === model3d) {
            return;
        }
        this._selected = model3d;
        for (const child of this.modelsParent.children) {
            child.setSelected(this._selected === child);
        }
        this.emit('onChangeModel', this._selected);
    }

    removeSelected() {
        if (this._selected) {
            this.modelsParent.remove(this._selected);
            this._selected = null;
            this.emit('onChangeModel', null);
        }
    }

    removeAll() {
        this.modelsParent.remove(...this.modelsParent.children);
        this._selected = null;
        this.emit('onChangeModel', null);
    }

    duplicateSelected() {
        if (this._selected) {
            const model3d = this._selected.clone();
            const {x, y} = this._selected.transformation;
            model3d.updateTransformation("x", x + 20)
            model3d.updateTransformation("y", x + 20)
            this.addModel(model3d)
        }
    }

    layFlat(){
        if (this._selected) {
            this._selected.layFlat();
            this.emit('onChangeTransformation', this._selected.transformation);
        }
    }

    updateTransformation(key, value) {
        //todo: 根据updateTransformation返回值，来确定是否需要emmit
        this._selected.updateTransformation(key, value);
        this.emit('onChangeTransformation', this._selected.transformation);
    }

    afterUpdateTransformation(key, value) {
        //todo: 根据updateTransformation返回值，来确定是否需要emmit
        this._selected.updateTransformation(key, value);
        this._selected.stickToPlate();
        this.emit('onChangeTransformation', this._selected.transformation);
    }
}

const p3dModelManager = new P3DModelManager();

export default p3dModelManager;

