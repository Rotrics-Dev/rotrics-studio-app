import socketClientManager from "../socket/socketClientManager";
import {getAllConfig, setOneConfig} from "../api/appConfig.js";

const ACTION_UPDATE_STATE = 'appConfig/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    is_show_tip: true
};

export const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", async () => {
            const {status, data} = await getAllConfig();
            const {is_show_tip} = data;
            dispatch(actions._updateState({is_show_tip}));
        });
    },
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    changeIsShowTip: (value) => async (dispatch) => {
        const {status, data} = await setOneConfig('is_show_tip', value);
        const {is_show_tip} = data;
        dispatch(actions._updateState({is_show_tip}));
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
