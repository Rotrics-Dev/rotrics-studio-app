import events from "events";
import socketClientManager from "../../../socket/socketClientManager";
import {P3D_SLICE_STATUS} from "../../../constants";
import {getUuid} from '../../../utils/index.js';

class P3DGcodeManager extends events.EventEmitter {
    constructor() {
        super();
        this.taskId = "";

        socketClientManager.on(P3D_SLICE_STATUS, (data) => {
            if (data.taskId === this.taskId) {
                this.emit(P3D_SLICE_STATUS, data);
            }
        });
    }

    loadGcode(url, onLoad, onProgress, onError) {
    }

    scheduleSliceTask(stlUrl, materialName, settingName) {
        this.taskId = getUuid();
        socketClientManager.p3dSliceAddTask(stlUrl, materialName, settingName, this.taskId);
    }
}

const p3dGcodeManager = new P3DGcodeManager();

export default p3dGcodeManager;
