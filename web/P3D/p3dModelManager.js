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

    //暂时只支持加载一个，只显示一个
    addModel(model2D) {
        this.modelsParent.remove(...this.modelsParent.children)
        this.modelsParent.add(model2D);
        this._selected = model2D;
    }

    undo() {
    }

    redo() {
    }

    //selected model的状态有改变: x, y, rotation, width, height; 切换selected model
    //应该分4种event：transform change，model change，config change，working parameters change
    _emmitChangeEvent() {
        this.emit('onChange', this._selected);
    }

    remove() {
        if (this._selected) {
            this.modelsParent.remove(this._selected);
            this._selected = null;
            this._emmitChangeEvent();
        }
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

    layFlat() {
    }


}

const p3dModelManager = new P3DModelManager();

export default p3dModelManager;
