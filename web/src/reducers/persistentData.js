const ACTION_UPDATE_STATE = 'PERSISTENT_DATA/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    z_p3d: localStorage.getItem('z_p3d'),
    z_write_and_draw: localStorage.getItem('z_write_and_draw'),
    z_laser: localStorage.getItem('z_laser')
};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setP3dWorkZ: (value) => (dispatch, getState) => {
        const key = 'z_p3d';
        dispatch(actions._updateState('z_p3d', value));
        localStorage.setItem(key, value);
    },
    setWriteAndDrawWorkZ: (value) => (dispatch, getState) => {
        const key = 'z_write_and_draw';
        dispatch(actions._updateState('z_write_and_draw', value));
        localStorage.setItem(key, value);
    },
    setLaserWorkZ: (value) => (dispatch, getState) => {
        const key = 'z_laser';
        dispatch(actions._updateState('z_laser', value));
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
