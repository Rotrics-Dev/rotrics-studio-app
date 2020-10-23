import {TAP_BASIC, TAP_LASER, TAP_P3D, TAP_CODE, TAP_SETTINGS, TAB_WRITE_AND_DRAW, TAP_DEBUG} from "../constants.js";

const ACTION_UPDATE_STATE = 'taps/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    tap: TAP_P3D
};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    //切换tap会触发多个canvas的resize，因此尽量少切换
    setTap: (value) => (dispatch, getState) => {
        if (getState().taps.tap !== value) {
            dispatch(actions._updateState({
                tap: value
            }));
        }
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE:
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}
