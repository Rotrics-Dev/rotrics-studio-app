import hotKeys from 'hotkeys-js';
import {TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW, TAP_CODE, TAP_SETTINGS} from "../constants.js";

import {actions as laserActions} from "./laser";
import {actions as p3dModelActions} from "./p3dModel";
import {actions as writeAndDrawActions} from "./writeAndDraw";

export const actions = {
    init: () => (dispatch, getState) => {
        hotKeys('backspace,del', (event, handler) => {
            event.preventDefault();
            switch (getState().taps.tap) {
                case TAP_P3D:
                    p3dModelActions.removeSelected();
                    break;
                case TAP_LASER:
                    dispatch(laserActions.removeSelected());
                    break;
                case TAB_WRITE_AND_DRAW:
                    dispatch(writeAndDrawActions.removeSelected());
            }
        });
        return {type: null};
    }
};

export default function reducer() {
    return {};
}
