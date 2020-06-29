import socketClientManager from "../socket/socketClientManager";
import {actions as serialPortActions} from './serialPort';
import {
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_DATA,
} from "../constants.js"

const ACTION_UPDATE_STATE = 'settings/ACTION_UPDATE_STATE';

//M2010: query firmware version
//M2011: query hardware version
const INITIAL_STATE = {
    firmwareVersion: null,
    hardwareVersion: null,
};

export const actions = {
    init: () => (dispatch) => {
        socketClientManager.addServerListener(SERIAL_PORT_GET_OPENED, (path) => {
            if (path) {
                dispatch(serialPortActions.write('M2010\nM2011\n'));
            }
        });
        socketClientManager.addServerListener(SERIAL_PORT_OPEN, (path) => {
            dispatch(serialPortActions.write('M2010\nM2011\n'));
        });
        socketClientManager.addServerListener(SERIAL_PORT_CLOSE, (path) => {
            dispatch(actions._updateState({firmwareVersion: null, hardwareVersion: null}));
        });
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            const {line} = data;
            if (line) {
                if (line.indexOf("Firmware ") === 0) {
                    const firmwareVersion = line.replace("Firmware", "").replace("\r", "").trim();
                    dispatch(actions._updateState({firmwareVersion}));
                }
                if (line.indexOf("Hardware ") === 0) {
                    const hardwareVersion = line.replace("Hardware", "").replace("\r", "").trim();
                    dispatch(actions._updateState({hardwareVersion}));
                }
            }
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
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
