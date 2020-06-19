import socketClientManager from "../socket/socketClientManager";
import {GCODE_UPDATE_SENDER_STATUS, GCODE_APPEND_SEND, GCODE_START_SEND, GCODE_STOP_SEND} from "../constants";

const ACTION_UPDATE_STATE = 'gcodeSend/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    status: ""
};

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.addServerListener("connect", () => {
            socketClientManager.emitToServer(GCODE_UPDATE_SENDER_STATUS);
        });
        socketClientManager.addServerListener(GCODE_UPDATE_SENDER_STATUS, (status) => {
            dispatch(actions._updateState({status}));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    start: (gcode) => {
        socketClientManager.emitToServer(GCODE_START_SEND, gcode + "\n");
        return {type: null};
    },
    append: (gcode) => {
        socketClientManager.emitToServer(GCODE_APPEND_SEND, gcode);
        return {type: null};
    },
    stop: () => {
        socketClientManager.emitToServer(GCODE_STOP_SEND);
        return {type: null};
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
