import events from "events";
import {computeBoundary} from "./toolPathUtils";

class WriteAndDrawManager extends events.EventEmitter {
    constructor() {
        super();
        this.modelsParent = null;
        this._selected = null;
        this.isAllPreviewed = false;
    }

    //设置模型要展示在哪个object3d上
    setModelsParent(object3d) {
        this.modelsParent = object3d;
    }

    addModel(model2d) {
        this.modelsParent.add(model2d);
        this.selectModel(model2d);
        this.emit('onChangeModel', this._selected);
        console.log("writeAndDrawText_onChangeModel_emit"+JSON.stringify(model2d))
        model2d.addEventListener('preview', () => {
            this._onPreviewStatusChange();
        });
    }

    _onPreviewStatusChange() {
        this.isAllPreviewed = true;
        for (let i = 0; i < this.modelsParent.children.length; i++) {
            const model = this.modelsParent.children[i];
            if (!model.isPreviewed) {
                this.isAllPreviewed = false;
                break;
            }
        }
        this.emit('onPreviewStatusChange', this.isAllPreviewed);
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
            const model2d = this._selected.clone();
            this.addModel(model2d)
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

    generateGcode() {
        const gcodeArr = [];
        for (let i = 0; i < this.modelsParent.children.length; i++) {
            const model = this.modelsParent.children[i];
            gcodeArr.push(model.generateGcode());
        }
        return gcodeArr.join("\n");
    }

    /**
     * 所有模型都preview后才能调用，控制逻辑由ui处理
     * @returns {Array}
     */
    getGcode4runBoundary() {
        const min = Number.MIN_VALUE;
        const max = Number.MAX_VALUE;
        let _minX = max, _minY = max;
        let _maxX = min, _maxY = min;
        for (let i = 0; i < this.modelsParent.children.length; i++) {
            const model = this.modelsParent.children[i];
            const {toolPathLines, settings} = model;
            const {minX, maxX, minY, maxY} = computeBoundary(toolPathLines, settings);
            _minX = Math.min(minX, _minX);
            _maxX = Math.max(maxX, _maxX);
            _minY = Math.min(minY, _minY);
            _maxY = Math.max(maxY, _maxY);
        }

        const p1 = {x: _minX.toFixed(1), y: _minY.toFixed(1)};
        const p2 = {x: _maxX.toFixed(1), y: _minY.toFixed(1)};
        const p3 = {x: _maxX.toFixed(1), y: _maxY.toFixed(1)};
        const p4 = {x: _minX.toFixed(1), y: _maxY.toFixed(1)};
        const gcodeArr = [];
        gcodeArr.push("G0 F800");
        gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
        // gcodeArr.push("M3 S255");
        gcodeArr.push(`G0 X${p2.x} Y${p2.y}`);
        gcodeArr.push(`G0 X${p3.x} Y${p3.y}`);
        gcodeArr.push(`G0 X${p4.x} Y${p4.y}`);
        gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
        // gcodeArr.push("M5");
        const gcode = gcodeArr.join("\n") + "\n";
        return gcode;
    }
}

const writeAndDrawManager = new WriteAndDrawManager();

export default writeAndDrawManager;
