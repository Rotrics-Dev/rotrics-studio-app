import events from "events";
import socketClientManager from "../../../socket/socketClientManager";
import {P3D_SLICE_STATUS} from "../../../constants";
import {getUuid} from '../../../utils/index.js';

/**
 * 维护g-code相关
 */
class P3DGcodeManager extends events.EventEmitter {
    constructor() {
        super();
        this.taskId = "";
        this.rendererParent = null; //g-code渲染后，作为其child；类型是：Three.Object3D
        socketClientManager.on(P3D_SLICE_STATUS, (data) => {
            if (data.taskId === this.taskId) {
                this.emit(P3D_SLICE_STATUS, data);
            }
        });
    }

    //设置gcode渲染结果要展示在哪个object3d上
    setRendererParent(object3d) {
        this.rendererParent = object3d;
    }

    startSlice(stlUrl, materialName, settingName, callback) {
        const taskId = getUuid();
        socketClientManager.removeAllListeners(P3D_SLICE_STATUS);
        socketClientManager.addListener(P3D_SLICE_STATUS, callback);
        socketClientManager.p3dSliceAddTask(stlUrl, materialName, settingName, taskId);
    }

    rendererGcode(url, onLoad, onProgress, onError) {
    }
}

const p3dGcodeManager = new P3DGcodeManager();

export default p3dGcodeManager;
