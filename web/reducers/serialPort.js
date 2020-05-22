import socketClientManager from "../socket/socketClientManager";
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
} from "../../shared/constants.js"

const SET_PATHS = 'SET_PATHS';
const SET_PATH = 'SET_PATH';
const SET_SERIAL_PORT_STATUS = 'SET_SERIAL_PORT_STATUS';

const INITIAL_STATE = {
    serialPortStatus: "close", //open/close/err  opening/closing
    paths: [],
    path: null //当前已连接的serial port的path
};

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.on(SERIAL_PORT_GET_PATH, (paths) => {
            console.log(SERIAL_PORT_GET_PATH + ": " + JSON.stringify(paths))
            dispatch(actions._setPaths(paths));
        });
        socketClientManager.on(SERIAL_PORT_GET_OPENED, (path) => {
            const status = "open";
            dispatch(actions._setSerialPortStatus(status));
            dispatch(actions._setPath(path));
        });
        socketClientManager.on(SERIAL_PORT_OPEN, (path) => {
            const status = "open";
            dispatch(actions._setSerialPortStatus(status));
            dispatch(actions._setPath(path));
        });
        socketClientManager.on(SERIAL_PORT_CLOSE, (path) => {
            const status = "close";
            dispatch(actions._setSerialPortStatus(status));
            dispatch(actions._setPath(null));
        });
        socketClientManager.on(SERIAL_PORT_ERROR, () => {
            const status = "err";
            dispatch(actions._setSerialPortStatus(status));
        });
    },
    getPaths: () => {
        socketClientManager.getSerialPortPath();
        return {
            type: null
        };
    },
    open: (path) => (dispatch) => {
        const status = "opening";
        dispatch(actions._setSerialPortStatus(status));
        socketClientManager.openSerialPort(path)
    },
    //close当前已连接的串口
    close: () => (dispatch) => {
        const status = "closing";
        dispatch(actions._setSerialPortStatus(status));
        socketClientManager.closeSerialPort()
    },
    //data: string|Buffer|Array<number>
    write: (str) => {
        socketClientManager.writeGcodeSerialPort(str);
        return {
            type: ""
        };
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
    _setSerialPortStatus: (status) => {
        return {
            type: SET_SERIAL_PORT_STATUS,
            value: status
        };
    },
    getSendGcodeStatus: () => {
        socketClientManager.getSendGcodeStatus();
        return {
            type: ""
        };
    },
    startSendGcode: (gcode) => {
        socketClientManager.startSendGcode(gcode);
        return {
            type: ""
        };
    },
    stopSendGcode: () => {
        socketClientManager.stopSendGcode();
        return {
            type: ""
        };
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_PATHS:
            return Object.assign({}, state, {paths: action.value});
        case SET_PATH:
            return Object.assign({}, state, {path: action.value});
        case SET_SERIAL_PORT_STATUS:
            return Object.assign({}, state, {serialPortStatus: action.value});
        default:
            return state;
    }
}
