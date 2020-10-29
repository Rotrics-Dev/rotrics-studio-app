import isElectron from 'is-electron';
import socketClientManager from "../socket/socketClientManager";

const ACTION_UPDATE_STATE = 'socket/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    status: "disconnect" //connect/disconnect
};

export const actions = {
    init: () => (dispatch) => {
        if (!isElectron()) {
            const port = 9000;
            window.serverAddress = `http://localhost:${port}`;
            window.serverCacheAddress = `http://localhost:${port}/cache/`;
            window.serverFontsAddress = `http://localhost:${port}/fonts/`;
        }
        console.log('server address: ' + window.serverAddress);
        console.log('server cache address: ' + window.serverCacheAddress);
        console.log('server fonts address: ' + window.serverFontsAddress);

        socketClientManager.initSocketClient(window.serverAddress);
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
        return {type: ACTION_UPDATE_STATE, state};
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
