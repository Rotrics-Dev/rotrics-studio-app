import socketClientManager from "../socket/socketClientManager";
import {actions as serialPortActions} from './serialPort';
import {
    FIRMWARE_UPGRADE_START,
    SERIAL_PORT_OPEN,
    FIRMWARE_UPGRADE_STEP_CHANGE,
    SERIAL_PORT_DATA,
} from "../constants.js"

const ACTION_UPDATE_STATE = 'firmwareUpgrade/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    isUpgrading: false,
    path: null,
    //ack
    current: 0,
    status: 'wait',
    description: null,
};

export const actions = {
    init: () => (dispatch, getState) => {
        // socketClientManager.addServerListener(SERIAL_PORT_OPEN, (path) => {
        //     const {isUpgrading} = getState().firmwareUpgrade;
        //     if (isUpgrading) {
        //         //"a": 中断传输
        //         //"5": print product info
        //         dispatch(serialPortActions.write("a5"));
        //     }
        // });
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
        socketClientManager.emitToServer(FIRMWARE_UPGRADE_START);
        return {type: null,};
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
