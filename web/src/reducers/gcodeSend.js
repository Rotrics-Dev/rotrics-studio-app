import message from "../utils/message";
import socketClientManager from "../socket/socketClientManager";
import {
    GCODE_UPDATE_SENDER_STATUS,
    GCODE_APPEND_SEND,
    GCODE_START_SEND,
    GCODE_STOP_SEND,
    MSG_SERIAL_PORT_CLOSE_TOAST, SERIAL_PORT_WRITE
} from "../constants";

const ACTION_UPDATE_STATE = 'gcodeSend/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    status: "",
    lineCountTotal: 0,
    lineCountSend: 0,
    lineCountSkipped: 0
};

export const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", () => {
            socketClientManager.emitToServer(GCODE_UPDATE_SENDER_STATUS);
        });
        socketClientManager.addServerListener(GCODE_UPDATE_SENDER_STATUS, (data) => {
            //见: gcodeSender.js _emitStatus
            //data: {status, lineCountTotal, lineCountSend, lineCountSkipped};
            const {status} = data;
            switch (status) {
                case "start":
                    message.success("Sending Start");
                    break;
                case "end":
                    message.success("Sending End");
                    break;
                case "stopped":
                    message.success("Sending Stopped");
                    break;
            }
            dispatch(actions._updateState({...data}));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    start: (gcode, requireStatus = true) => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(GCODE_START_SEND, {gcode: gcode + "\n", requireStatus});
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
