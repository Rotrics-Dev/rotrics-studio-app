import socketClientManager from "../socket/socketClientManager";
import {actions as serialPortActions} from './serialPort';
import {
    FIRMWARE_UPGRADE_START,
    SERIAL_PORT_OPEN,
    FIRMWARE_UPGRADE_STEP_CHANGE,
    SERIAL_PORT_DATA,
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
                console.log("#write a5....")
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
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            const {received} = data;
            console.log("#received: " + received)
            if (received) {
                //收到"Hardware Version: Vxx"，表示处在boot loader模式下，提示强制升级
                //收到"Hardware Vxx"或"Firmware Vxx"，表示处在app
                if (received.startsWith("Hardware Version:")) {
                    const hardwareVersion = received.replace("Hardware Version:", "").replace("\r", "").trim();
                    console.log("boot loader hardwareVersion -> " + hardwareVersion)
                    dispatch(actions._updateState({
                        hardwareVersion,
                        bootLoaderModalVisible: true,
                        isInBootLoader: true
                    }));
                } else if (received.startsWith("Firmware ")) {
                    const firmwareVersion = received.replace("Firmware", "").replace("\r", "").trim();
                    console.log("app firmwareVersion -> " + firmwareVersion)
                    dispatch(actions._updateState({
                        firmwareVersion,
                        bootLoaderModalVisible: false,
                        isInBootLoader: false
                    }));
                } else if (received.startsWith("Hardware ")) {
                    const hardwareVersion = received.replace("Hardware", "").replace("\r", "").trim();
                    console.log("app hardwareVersion -> " + hardwareVersion)
                    dispatch(actions._updateState({
                        hardwareVersion,
                        bootLoaderModalVisible: false,
                        isInBootLoader: false
                    }));
                }
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
