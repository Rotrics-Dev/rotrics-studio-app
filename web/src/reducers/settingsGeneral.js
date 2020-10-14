import socketClientManager from "../socket/socketClientManager";
import ReactGA from 'react-ga';
import {actions as serialPortActions} from './serialPort';
import {
    FIRMWARE_UPGRADE_START,
    SERIAL_PORT_OPEN,
    FIRMWARE_UPGRADE_STEP_CHANGE,
    SERIAL_PORT_RECEIVED_LINE,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_CLOSE
} from "../constants.js"

const ACTION_UPDATE_STATE = 'settingsGeneral/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    firmwareVersion: null,
    hardwareVersion: null,
    path: null,
    bootLoaderModalVisible: false,
    isInBootLoader: false,
    //ack
    current: 0,
    status: 'wait',
    description: null,
};

export const actions = {
    init: () => (dispatch, getState) => {
        const callback4open = (path) => {
            if (path) {
                dispatch(serialPortActions.write('M2010\nM2011\na5\n'));
            }
        };
        socketClientManager.addServerListener(SERIAL_PORT_GET_OPENED, callback4open);
        socketClientManager.addServerListener(SERIAL_PORT_OPEN, callback4open);

        socketClientManager.addServerListener(SERIAL_PORT_CLOSE, (path) => {
            dispatch(actions._updateState({
                firmwareVersion: null,
                hardwareVersion: null,
                bootLoaderModalVisible: false,
                isInBootLoader: false
            }));
        });
        socketClientManager.addServerListener(SERIAL_PORT_RECEIVED_LINE, (line) => {
            //收到"Hardware Version: Vxx"，表示处在boot loader模式下，提示强制升级
            //收到"Hardware Vxx"或"Firmware Vxx"，表示处在app
            if (line.startsWith("Hardware Version:")) {
                const hardwareVersion = line.replace("Hardware Version:", "").replace("\r", "").trim();
                dispatch(actions._updateState({
                    hardwareVersion,
                    bootLoaderModalVisible: true,
                    isInBootLoader: true
                }));
            } else if (line.startsWith("Firmware ")) {
                const firmwareVersion = line.replace("Firmware", "").replace("\r", "").trim();
                dispatch(actions._updateState({
                    firmwareVersion,
                    bootLoaderModalVisible: false,
                    isInBootLoader: false
                }));
                ReactGA.event({
                    category: 'firmwareVersion',
                    action: firmwareVersion
                });
            } else if (line.startsWith("Hardware ")) {
                const hardwareVersion = line.replace("Hardware", "").replace("\r", "").trim();
                dispatch(actions._updateState({
                    hardwareVersion,
                    bootLoaderModalVisible: false,
                    isInBootLoader: false
                }));
                ReactGA.event({
                    category: 'hardwareVersion',
                    action: hardwareVersion
                });
            }
        });

        //data: {step, status, description}
        socketClientManager.addServerListener(FIRMWARE_UPGRADE_STEP_CHANGE, (data) => {
            const {current, status, description} = data;
            dispatch(actions._updateState({current, status, description}));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    reset: () => (dispatch, getState) => {
        dispatch(actions._updateState({current: 0, status: 'wait', description: null}));
    },
    start: () => (dispatch, getState) => {
        const {isInBootLoader} = getState().settingsGeneral;
        socketClientManager.emitToServer(FIRMWARE_UPGRADE_START, {isInBootLoader});
        dispatch(actions._updateState({bootLoaderModalVisible: false}));
    },
    closeBootLoaderModal: () => (dispatch) => {
        dispatch(actions._updateState({bootLoaderModalVisible: false}));
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
