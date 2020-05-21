import events from "events";

/**
 * 管理p3d printing settings
 */
class P3DSettingManager extends events.EventEmitter {
    constructor() {
        super();
        this.selected = null;
    }

    fetchAll() {
    }

    update(key, value) {
    }

    rename(newName) {
    }

    delete() {
    }

    clone() {
    }

    select(name) {
    }
}

const p3dSettingManager = new P3DSettingManager();

export default p3dSettingManager;
