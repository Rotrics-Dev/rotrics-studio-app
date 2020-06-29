import {TAP_LASER, TAP_P3D, TAP_CODE, TAP_SETTINGS, TAB_WRITE_AND_DRAW} from "../constants.js";

const SET_TAP = "taps/SET_TAP";

const INITIAL_STATE = {
    tap: TAP_SETTINGS
};

export const actions = {
    //切换tap会触发多个canvas的resize，因此尽量少切换
    setTap: (value) => (dispatch, getState) => {
        if (getState().taps.tap !== value) {
            dispatch(actions._setTap(value));
        }
    },
    _setTap: (value) => {
        return {
            type: SET_TAP,
            value
        };
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_TAP:
            const {value} = action;
            return Object.assign({}, state, {tap: value});
        default:
            return state;
    }
}
