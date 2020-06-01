import socketClientManager from "../socket/socketClientManager";
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
} from "../constants.js"

const SET_PATHS = 'serialPort/SET_PATHS';
const SET_PATH = 'serialPort/SET_PATH';
const SET_STATUS = 'serialPort/SET_STATUS';

const INITIAL_STATE = {
    status: "close", //open/close/err
    paths: [],
    path: null //当前已连接的serial port的path
};

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.on("socket", (status) => {
            if (status === "connect") {
                socketClientManager.getSerialPortOpened();
            } else {
                dispatch(actions._setStatus("close"));
                dispatch(actions._setPaths([]));
                dispatch(actions._setPath(null));
            }
        });
        socketClientManager.on(SERIAL_PORT_GET_PATH, (paths) => {
            dispatch(actions._setPaths(paths));
        });
        socketClientManager.on(SERIAL_PORT_GET_OPENED, (path) => {
            const status = "open";
            dispatch(actions._setStatus(status));
            dispatch(actions._setPath(path));
        });
        socketClientManager.on(SERIAL_PORT_OPEN, (path) => {
            const status = "open";
            dispatch(actions._setStatus(status));
            dispatch(actions._setPath(path));
        });
        socketClientManager.on(SERIAL_PORT_CLOSE, (path) => {
            const status = "close";
            dispatch(actions._setStatus(status));
            dispatch(actions._setPath(null));
        });
        socketClientManager.on(SERIAL_PORT_ERROR, () => {
            const status = "err";
            dispatch(actions._setStatus(status));
        });
    },
    getPaths: () => {
        socketClientManager.getSerialPortPath();
        return {type: null};
    },
    open: (path) => () => {
        socketClientManager.openSerialPort(path);
        return {type: null};
    },
    //close当前已连接的串口
    close: () => () => {
        socketClientManager.closeSerialPort();
        return {type: null};
    },
    //data: string|Buffer|Array<number>
    write: (data) => {
        socketClientManager.writeSerialPort(data);
        return {type: null};
    },
    _setPaths: (paths) => {
        return {
            type: SET_PATHS,
            value: paths
        };
    },
    _setPath: (path) => {
        return {
            type: SET_PATH,
            value: path
        };
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
        case SET_PATHS:
            return Object.assign({}, state, {paths: action.value});
        case SET_PATH:
            return Object.assign({}, state, {path: action.value});
        case SET_STATUS:
            return Object.assign({}, state, {status: action.value});
        default:
            return state;
    }
}
