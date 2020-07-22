import ScratchBlocks from "rotrics-scratch-blocks";

const ACTION_UPDATE_STATE = 'settingsConfig/ACTION_UPDATE_STATE';

const INITIAL_STATE = {

};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
}
