import hotKeys from 'hotkeys-js';
import {TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW, TAP_CODE, TAP_SETTINGS} from "../constants.js";

import {actions as model2dActions} from "./model2d";
import {actions as p3dModelActions} from "./p3dModel";

export const actions = {
    init: () => (dispatch, getState) => {
        hotKeys('backspace,del', (event, handler) => {
            event.preventDefault();
            switch (getState().taps.tap) {
                case TAP_P3D:
                    dispatch(p3dModelActions.removeSelected());
                    break;
                case TAP_LASER:
                    dispatch(model2dActions.removeSelected('laser'));
                    break;
                case TAB_WRITE_AND_DRAW:
                    dispatch(model2dActions.removeSelected('write_draw'));
            }
        });
        return {type: null};
    }
};

export default function reducer() {
    return {};
}
