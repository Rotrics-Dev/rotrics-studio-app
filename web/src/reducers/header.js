const ACTION_UPDATE_STATE = 'header/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    terminalVisible: false,
    jogPanelVisible: false,
    p3dCalibrationVisible: false
};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    changeVisibility4terminal: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            terminalVisible: visible
        }));
    },
    changeVisibility4jogPanel: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            jogPanelVisible: visible
        }));
    },
    changeVisibility4p3dCalibration: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            p3dCalibrationVisible: visible
        }));
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE:
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}
