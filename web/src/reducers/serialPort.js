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

const ACTION_UPDATE_STATE = 'serialPort/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    paths: [],
    path: null //当前已连接的serial port的path
};

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
            console.error("err")
            dispatch(actions._updateState({path: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            console.log("SERIAL_PORT_DATA： " + data)
        });

    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    open: (path) => () => {
        socketClientManager.emitToServer(SERIAL_PORT_OPEN, path);
        return {type: null};
    },
    //close当前已连接的串口
    close: () => () => {
        socketClientManager.emitToServer(SERIAL_PORT_CLOSE);
        return {type: null};
    },
    //data: string|Buffer|Array<number>
    write: (data) => {
        socketClientManager.emitToServer(SERIAL_PORT_WRITE, data);
        return {type: null};
    },
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
