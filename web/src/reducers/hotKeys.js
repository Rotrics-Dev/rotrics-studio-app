import hotKeys from 'hotkeys-js';
import laserManager from "../containers/laser/lib/laserManager.js";
import writeAndDrawManager from "../containers/writeAndDraw/lib/writeAndDrawManager";
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";
import {TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW, TAP_CODE, TAP_SETTINGS} from "../constants.js";

//放在redux中是为了方便管理，
//根据当前的tap，执行不同的操作
//可以通过state，方便获取tap
export const actions = {
    init: () => (dispatch, getState) => {
        hotKeys('backspace,del', (event, handler) => {
            event.preventDefault();

            switch (getState().taps.tap) {
                case TAP_P3D:
                    p3dModelManager.removeSelected();
                    break;
                case TAP_LASER:
                    laserManager.removeSelected();
                    break;
                case TAB_WRITE_AND_DRAW:
                    writeAndDrawManager.removeSelected()
            }
        });
        return {type: null};
    }
};

export default function reducer() {
    return {};
}
