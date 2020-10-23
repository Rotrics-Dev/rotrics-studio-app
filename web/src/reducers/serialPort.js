import messageI18n from "../utils/messageI18n";
import socketClientManager from "../socket/socketClientManager";
import {
    SERIAL_PORT_ACTION_GET_ALL_PATHS,
    SERIAL_PORT_ACTION_GET_OPEN_PATH,
    SERIAL_PORT_ACTION_OPEN,
    SERIAL_PORT_ACTION_CLOSE,
    SERIAL_PORT_ACTION_WRITE,

    SERIAL_PORT_ON_GET_ALL_PATHS,
    SERIAL_PORT_ON_GET_OPEN_PATH,
    SERIAL_PORT_ON_OPEN,
    SERIAL_PORT_ON_CLOSE,
    SERIAL_PORT_ON_ERROR,
    SERIAL_PORT_ON_WRITE_ERROR,
    SERIAL_PORT_ON_WRITE_OK,
    SERIAL_PORT_ON_RECEIVED_LINE,
    SERIAL_PORT_ON_WARNING,
    SERIAL_PORT_ON_INSERT,
    SERIAL_PORT_ON_PULL_OUT,
} from "../constants.js"
import {getUuid} from "../utils";
import notificationI18n from "../utils/notificationI18n";

const ACTION_UPDATE_STATE = 'serialPort/ACTION_UPDATE_STATE';

const KEY_ON_INSERT = getUuid();
const KEY_ON_PULL_OUT = getUuid();

const INITIAL_STATE = {
    paths: [],
    path: null //当前已连接的serial port的path; path为空，则表示serial port close；否则open
};

let gcodeResponseListenType = null;
let gcodeResponseListener = null;

const processGcodeResponseListen = (line) => {
    if (!gcodeResponseListenType) return;
    if (!line) return;

    let needClearListener;
    switch (gcodeResponseListenType) {
        case 'M893':
            needClearListener = processM894(line);
            break;
        case 'M114':
            needClearListener = processM114(line);
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
        setInterval(() => {
            socketClientManager.emitToServer(SERIAL_PORT_ACTION_GET_ALL_PATHS);
        }, 1000);
        socketClientManager.addServerListener("connect", () => {
            dispatch(actions._updateState({paths: [], path: null}));
            socketClientManager.emitToServer(SERIAL_PORT_ACTION_GET_OPEN_PATH);
        });
        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({paths: [], path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_GET_ALL_PATHS, (paths) => {
            dispatch(actions._updateState({paths}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_GET_OPEN_PATH, (path) => {
            dispatch(actions._updateState({path}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_OPEN, (path) => {
            messageI18n.success("connect success");
            dispatch(actions._updateState({path}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_CLOSE, (path) => {
            messageI18n.success("disconnect success");
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_ERROR, ({message}) => {
            messageI18n.error(message);
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_WRITE_ERROR, ({message, data}) => {
            messageI18n.error(message);
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_WRITE_OK, ({data}) => {
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_WARNING, ({message}) => {
            messageI18n.warning(message);
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_RECEIVED_LINE, (line) => {
            // console.log('receive: ', line)
            processGcodeResponseListen(line);
            //存在单词拼写错误，fix it
            if (line.indexOf("beyound limit..") !== -1) {
                line = line.replace("beyound", "beyond");
            }
            if (
                line.indexOf("beyond limit..") !== -1 ||
                line.indexOf("Send M1112 or click HOME to initialize DexArm first before any motion") !== -1 ||
                line.indexOf("Warning!Laser protection door opened") !== -1 ||
                line.indexOf("Laser protection door closed") !== -1
            ) {
                messageI18n.warning(line);
            }
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_INSERT, (paths) => {
            console.log(SERIAL_PORT_ON_INSERT, paths)
            notificationI18n.success({
                key: KEY_ON_INSERT,
                message: 'Cable Inserted',
                description: paths[0],
                // duration: 3
            });
            notificationI18n.close(KEY_ON_PULL_OUT);
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_PULL_OUT, (paths) => {
            console.log(SERIAL_PORT_ON_PULL_OUT, paths)
            notificationI18n.error({
                key: KEY_ON_PULL_OUT,
                message: 'Cable Pulled Out',
                description: paths[0],
                duration: 1  //设置延时，防止调平断联时消息不消失
            });
            notificationI18n.close(KEY_ON_INSERT)
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    open: (path) => () => {
        socketClientManager.emitToServer(SERIAL_PORT_ACTION_OPEN, path);
        return {type: null};
    },
    //close当前已连接的串口
    close: () => () => {
        socketClientManager.emitToServer(SERIAL_PORT_ACTION_CLOSE);
        return {type: null};
    },
    //data: string|Buffer|Array<number>
    write: (data) => (dispatch, getState) => {
        if (getState().serialPort.path) {
            socketClientManager.emitToServer(SERIAL_PORT_ACTION_WRITE, data);
        } else {
            messageI18n.warning('Please connect DexArm first');
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
