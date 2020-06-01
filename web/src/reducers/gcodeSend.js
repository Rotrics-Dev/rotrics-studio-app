import socketClientManager from "../socket/socketClientManager";
import {
    GCODE_UPDATE_SENDER_STATUS
} from "../constants.js"

const SET_STATUS = 'gcodeSend/SET_STATUS';

const INITIAL_STATE = {
    status: ""
};

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.on("socket", (status) => {
            if (status === "connect") {
                socketClientManager.updateGcodeSenderStatus();
            }
        });
        socketClientManager.on(GCODE_UPDATE_SENDER_STATUS, (status) => {
            dispatch(actions._setStatus(status));
        });
    },
    _setStatus: (status) => {
        return {
            type: SET_STATUS,
            value: status
        };
    },
    start: (gcode) => {
        socketClientManager.startSendGcode(gcode + "\n");
        return {type: null};
    },
    append: (gcode) => {
        socketClientManager.appendSendGcode(gcode);
        return {type: null};
    },
    stop: () => {
        socketClientManager.stopSendGcode();
        return {type: null};
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
