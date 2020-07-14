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
import {notification} from 'antd';
import {getUuid} from "../utils";

const ACTION_UPDATE_STATE = 'firmwareUpgrade/ACTION_UPDATE_STATE';

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

let timerId = 0;
const timeoutDuration = 5000;
const notificationKey = getUuid();

export const actions = {
    init: () => (dispatch, getState) => {
        const callback4open = (path) => {
            if (path) {
                dispatch(serialPortActions.write('a5\nM2010\nM2011'));
                // clearTimeout(timerId);
                // timerId = setTimeout(() => {
                //     const {hardwareVersion} = getState().firmwareUpgrade;
                //     if (!hardwareVersion) {
                //         notification.warn({
                //             key: notificationKey,
                //             message: 'Connection Warning',
                //             description: 'The device connected is not DexArm',
                //             duration: 0
                //         });
                //     }
                // }, timeoutDuration);
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
            if (received) {
                if (received.indexOf("Firmware ") === 0) {
                    const firmwareVersion = received.replace("Firmware", "").replace("\r", "").trim();
                    dispatch(actions._updateState({
                        firmwareVersion,
                        bootLoaderModalVisible: false,
                        isInBootLoader: false
                    }));
                }
                if (received.indexOf("Hardware ") === 0) {
                    const hardwareVersion = received.replace("Hardware", "").replace("\r", "").trim();
                    dispatch(actions._updateState({
                        hardwareVersion,
                        bootLoaderModalVisible: false,
                        isInBootLoader: false
                    }));
                }
                //处在boot loader模式下，提示强制升级
                //hack: 半角，全角的冒号，两种都存在
                if (received.indexOf("Hardware Version:") === 0) {
                    const hardwareVersion = received.replace("Hardware Version:", "").replace("\r", "").trim();
                    dispatch(actions._updateState({
                        hardwareVersion,
                        bootLoaderModalVisible: true,
                        isInBootLoader: true
                    }));
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
    reset: () => (dispatch, getState) => {
        dispatch(actions._updateState({current: 0, status: 'wait', description: null}));
    },
    start: () => (dispatch, getState) => {
        //data: {step, status, description}
        socketClientManager.addServerListener(FIRMWARE_UPGRADE_STEP_CHANGE, (data) => {
            const {current, status, description} = data;
            dispatch(actions._updateState({current, status, description}));
        });
        const {isInBootLoader} = getState().firmwareUpgrade;
        socketClientManager.emitToServer(FIRMWARE_UPGRADE_START, {isInBootLoader});
        return {type: null,};
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
