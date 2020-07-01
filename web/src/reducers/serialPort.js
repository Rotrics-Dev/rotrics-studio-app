import {message} from 'antd';
import socketClientManager from "../socket/socketClientManager";
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
    MSG_SERIAL_PORT_CLOSE_TOAST
} from "../constants.js"


const ACTION_UPDATE_STATE = 'serialPort/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    paths: [],
    path: null //当前已连接的serial port的path; path为空，则表示serial port close；否则open
};
let onPositionListener = null;//用于M893位置查询的回调

const processM894 = (data) => {
    if (!onPositionListener) return;
    if (!data) return;
    if (!data.received) return;
    if (!data.received.startsWith("M894")) return;
    console.log(data.received);
    const split = data.received.trim().split(' ');
    onPositionListener(
        parseInt(split[1].slice(1, split[1].length)),//X
        parseInt(split[2].slice(1, split[2].length)),//Y
        parseInt(split[3].slice(1, split[3].length)),//Z
    );
    onPositionListener = null;
}

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.addServerListener("connect", () => {
            dispatch(actions._updateState({paths: [], path: null}));
            socketClientManager.emitToServer(SERIAL_PORT_GET_OPENED);
        });
        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({paths: [], path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_GET_PATH, (paths) => {
            dispatch(actions._updateState({paths}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_GET_OPENED, (path) => {
            dispatch(actions._updateState({path}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_OPEN, (path) => {
            dispatch(actions._updateState({path}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_CLOSE, (path) => {
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ERROR, () => {
            console.error("serial port -> err");
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            processM894(data);
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    open: (path) => () => {
        console.log("path: " + path)
        socketClientManager.emitToServer(SERIAL_PORT_OPEN, path);
        return {type: null};
    },
    //close当前已连接的串口
    close: () => () => {
        socketClientManager.emitToServer(SERIAL_PORT_CLOSE);
        return {type: null};
    },
    //data: string|Buffer|Array<number>
    write: (data) => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(SERIAL_PORT_WRITE, data);
        } else {
            message.warning(MSG_SERIAL_PORT_CLOSE_TOAST);
        }
        return {type: null};
    },
    addPositionListener: (onPosition) => {
        onPositionListener = onPosition;
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
