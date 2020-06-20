import {message} from 'antd';
import socketClientManager from "../socket/socketClientManager";
import {
    GCODE_UPDATE_SENDER_STATUS,
    GCODE_APPEND_SEND,
    GCODE_START_SEND,
    GCODE_STOP_SEND,
    MSG_SERIAL_PORT_CLOSE_TOAST
} from "../constants";

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
    start: (gcode) => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(GCODE_START_SEND, gcode + "\n");
        } else {
            message.warning(MSG_SERIAL_PORT_CLOSE_TOAST);
        }
        return {type: null};
    },
    append: (gcode) => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(GCODE_APPEND_SEND, gcode);
        } else {
            message.warning(MSG_SERIAL_PORT_CLOSE_TOAST);
        }
        return {type: null};
    },
    stop: () => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(GCODE_STOP_SEND);
        } else {
            message.warning(MSG_SERIAL_PORT_CLOSE_TOAST);
        }
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
