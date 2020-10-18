const ACTION_UPDATE_STATE = 'header/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    monitorVisible: false,
    controlPanelVisible: false,
    p3dCalibrationVisible: false,
    serialPortConnectionVisible: false
};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    changeVisible4monitor: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            monitorVisible: visible
        }));
    },
    changeVisible4controlPanel: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            controlPanelVisible: visible
        }));
    },
    changeVisible4p3dCalibration: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            p3dCalibrationVisible: visible
        }));
    },
    changeVisible4serialPortConnection: (visible) => (dispatch) => {
        dispatch(actions._updateState({
            serialPortConnectionVisible: visible
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
