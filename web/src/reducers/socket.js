import isElectron from 'is-electron';
import socketClientManager from "../socket/socketClientManager";

const ACTION_UPDATE_STATE = 'socket/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    status: "disconnect" //connect/disconnect
};

export const actions = {
    init: () => (dispatch) => {
        if (!isElectron()) {
            window.serverIp = "http://localhost:9000"
        }
        console.log("serverIp: " + window.serverIp);
        socketClientManager.initSocketClient(window.serverIp);
        socketClientManager.addServerListener("connect", () => {
            console.log("socket -> connect")
            dispatch(actions._updateState({status: "connect"}));
        });
        socketClientManager.addServerListener("disconnect", () => {
            console.log("socket -> disconnect")
            dispatch(actions._updateState({status: "disconnect"}));
        });
    },
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
