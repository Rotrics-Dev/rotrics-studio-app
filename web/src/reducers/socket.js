import isElectron from 'is-electron';
import socketClientManager from "../socket/socketClientManager";

const SET_STATUS = 'socket/SET_STATUS';

const INITIAL_STATE = {
    status: "disconnect" //connect/disconnect
};

export const actions = {
    init: () => (dispatch) => {
        if (!isElectron()) {
            window.serverIp = "http://localhost:9000"
        }
        console.log("serverIp: " + window.serverIp);
        socketClientManager.setup(window.serverIp);

        socketClientManager.on("socket", (status) => {
            console.log("socket -> " + status)
            dispatch(actions._setStatus(status));
        });
    },
    _setStatus: (status) => {
        return {
            type: SET_STATUS,
            value: status
        };
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_STATUS:
            return Object.assign({}, state, {status: action.value});
        default:
            return state;
    }
}
