import socketManager from "../socket/socketManager";

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
        socketManager.on("on-serialPort-query", (data) => {
            console.log("on-serialPort-query: " + JSON.stringify(data))
            const paths = data.paths;
            dispatch(actions._setPaths(paths));
        });
        socketManager.on("on-serialPort-open", (data) => {
            const status = "open";
            const path = data.path;
            dispatch(actions._setSerialPortStatus(status));
            dispatch(actions._setPath(path));
        });
        socketManager.on("on-serialPort-close", (data) => {
            const status = "close";
            dispatch(actions._setSerialPortStatus(status));
            dispatch(actions._setPath(null));
        });
        socketManager.on("on-serialPort-error", () => {
            const status = "err";
            dispatch(actions._setSerialPortStatus(status));
        });
    },
    getPaths: () => {
        socketManager.querySerialPort();
        return {
            type: null
        };
    },
    open: (path) => async (dispatch) => {
        const status = "opening";
        dispatch(actions._setSerialPortStatus(status));
        socketManager.openSerialPort(path)
    },
    //close当前已连接的串口
    close: () => async (dispatch) => {
        const status = "closing";
        dispatch(actions._setSerialPortStatus(status));
        socketManager.closeSerialPort()
    },
    //data: string|Buffer|Array<number>
    write: (str) => {
        socketManager.writeGcodeSerialPort(str);
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
    loadGcode: (gcode) => {
        socketManager._sendData("gcode-send-load", {gcode});
        return {
            type: ""
        };
    },
    startSendGcode: () => {
        socketManager._sendData("gcode-send-start");
        return {
            type: ""
        };
    },
    stopSendGcode: () => {
        socketManager._sendData("gcode-send-stop");
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
