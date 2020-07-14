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

};

export const actions = {
    init: () => (dispatch) => {

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
