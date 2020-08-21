const ACTION_UPDATE_STATE = 'PERSISTENT_DATA/ACTION_UPDATE_STATE';
const WORK_HEIGHT = {
    P3D: 'WORK_HEIGHT_P3D',
    LASER: 'WORK_HEIGHT_LASER',
    PEN: 'WORK_HEIGHT_PEN'
};

const INITIAL_STATE = {
    workHeightP3d: localStorage.getItem(WORK_HEIGHT.P3D),
    workHeightPen: localStorage.getItem(WORK_HEIGHT.PEN),
    workHeightLaser: localStorage.getItem(WORK_HEIGHT.LASER)
};

export const actions = {
    _updateState: (state) => {
        console.log(state)
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setWorkHeightP3d: (value) => (dispatch, getState) => {
        const key = WORK_HEIGHT.P3D;
        dispatch(actions._updateState({workHeightP3d: value}));
        localStorage.setItem(key, value);
    },
    setWorkHeightPen: (value) => (dispatch, getState) => {
        const key = WORK_HEIGHT.PEN;
        dispatch(actions._updateState({workHeightPen: value}));
        localStorage.setItem(key, value);
        console.log('setWorkHeightPen' + value);
    },
    setWorkHeightLaser: (value) => (dispatch, getState) => {
        const key = WORK_HEIGHT.LASER;
        dispatch(actions._updateState({workHeightLaser: value}));
        localStorage.setItem(key, value);
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
