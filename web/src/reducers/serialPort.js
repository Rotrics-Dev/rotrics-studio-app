import messageI18n from "../utils/messageI18n";
import socketClientManager from "../socket/socketClientManager";
import {
    SERIAL_PORT_PATH_UPDATE,
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

let gcodeResponseListenType = null;
let gcodeResponseListener = null;

const processGcodeResponseListen = (data) => {
    if (!gcodeResponseListenType) return;
    if (!data) return;
    if (!data.received) return;

    let needClearListener;
    switch (gcodeResponseListenType) {
        case 'M893':
            needClearListener = processM894(data.received);
            break;
        case 'M114':
            needClearListener = processM114(data.received);
            break;
        default:
            console.log('add unsupported gcode listener')
            needClearListener = true;
            break;
    }
    if (needClearListener) {
        gcodeResponseListenType = null;
        gcodeResponseListener = null;
    }
}

const processM894 = (received) => {
    if (!received.startsWith("M894")) return false;
    console.log(received);

    const split = received.trim().split(' ');
    gcodeResponseListener && gcodeResponseListener(
        parseFloat(split[1].slice(1, split[1].length)),//X
        parseFloat(split[2].slice(1, split[2].length)),//Y
        parseFloat(split[3].slice(1, split[3].length)),//Z
    );
    return true;
}
const processM114 = (received) => {
    if (!received.startsWith('X:')) return false;
    const split = received.trim().split(' ');
    if (!split[1].startsWith('Y:')) return false;
    if (!split[2].startsWith('Z:')) return false;
    console.log(received);

    gcodeResponseListener && gcodeResponseListener(
        parseFloat(split[0].split(':')[1]),
        parseFloat(split[1].split(':')[1]),
        parseFloat(split[2].split(':')[1])
    );
    return true;
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
        socketClientManager.addServerListener(SERIAL_PORT_PATH_UPDATE, (paths) => {
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
            processGcodeResponseListen(data);
            let {received} = data;
            //存在单词拼写错误，fix it
            if (received.indexOf("beyound limit..") !== -1) {
                received = received.replace("beyound", "beyond");
            }
            if (
                received.indexOf("beyond limit..") !== -1 ||
                received.indexOf("Send M1112 or click HOME to initialize DexArm first before any motion") !== -1 ||
                received.indexOf("Warning!Laser protection door opened") !== -1 ||
                received.indexOf("Laser protection door closed") !== -1
            ) {
                messageI18n.warning(received);
            }
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
            messageI18n.warning(MSG_SERIAL_PORT_CLOSE_TOAST);
        }
        return {type: null};
    },

    /**
     * 添加查询回调
     * @param gcode M114 M893，等用于查询的Gcode
     * @param listener
     */
    addOneShootGcodeResponseListener: (gcode, listener) => (dispatch, getState) => {
        gcodeResponseListenType = gcode;
        gcodeResponseListener = listener;
        dispatch(actions.write(gcode + '\n'));
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
