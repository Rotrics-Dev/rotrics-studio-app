const ACTION_UPDATE_STATE = 'header/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    terminalVisible: false,
    jogPanelVisible: true,
};

export const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    openTerminal: () => (dispatch) => {
        dispatch(actions._updateState({
            terminalVisible: true
        }));
    },
    closeTerminal: () => (dispatch) => {
        dispatch(actions._updateState({
            terminalVisible: false
        }));
    },
    openJogPanel: () => (dispatch) => {
        dispatch(actions._updateState({
            jogPanelVisible: true
        }));
    },
    closeJogPanel: () => (dispatch) => {
        dispatch(actions._updateState({
            jogPanelVisible: false
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
