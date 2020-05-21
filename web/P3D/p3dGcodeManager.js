import events from "events";

class P3DGcodeManager extends events.EventEmitter {
    constructor() {
        super();
    }

    loadGcode(url, onLoad, onProgress, onError) {
    }

    scheduleSliceTask(materialName, printingName, stlUrl, taskId) {
    }
}

const p3dGcodeManager = new P3DGcodeManager();

export default p3dGcodeManager;
