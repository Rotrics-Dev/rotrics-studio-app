const ACTION_UPDATE_STATE = 'PERSISTENT_DATA/ACTION_UPDATE_STATE';
const WORK_HEIGHT = {
    P3D: 'WORK_HEIGHT_P3D',
    LASER: 'WORK_HEIGHT_LASER',
    PEN: 'WORK_HEIGHT_PEN'
};

const IS_TOOLTIP_DISPLAYED = "IS_TOOLTIP_DISPLAYED";

if (localStorage.getItem(IS_TOOLTIP_DISPLAYED) === null) {
    localStorage.setItem(IS_TOOLTIP_DISPLAYED, true);
}

const INITIAL_STATE = {
    workHeightP3d: localStorage.getItem(WORK_HEIGHT.P3D),
    workHeightPen: localStorage.getItem(WORK_HEIGHT.PEN),
    workHeightLaser: localStorage.getItem(WORK_HEIGHT.LASER),
    isTooltipDisplayed: localStorage.getItem(IS_TOOLTIP_DISPLAYED),
};

export const actions = {
    _updateState: (state) => {
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
    },
    setWorkHeightLaser: (value) => (dispatch, getState) => {
        const key = WORK_HEIGHT.LASER;
        dispatch(actions._updateState({workHeightLaser: value}));
        localStorage.setItem(key, value);
    },
    setIsTooltipDisplayed: (value) => (dispatch) => {
        const key = IS_TOOLTIP_DISPLAYED;
        dispatch(actions._updateState({isTooltipDisplayed: value}));
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
