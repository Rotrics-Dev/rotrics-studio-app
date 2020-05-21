import events from "events";

/**
 * 管理p3d printing material
 */
class P3DMaterialManager extends events.EventEmitter {
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

const p3dMaterialManager = new P3DMaterialManager();

export default p3dMaterialManager;
