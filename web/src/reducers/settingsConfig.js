import socketClientManager from "../socket/socketClientManager";
import {actions as serialPortActions} from './serialPort';
import {
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_DATA,
} from "../constants.js"
import ScratchBlocks from "rotrics-scratch-blocks";

const ACTION_UPDATE_STATE = 'settingsConfig/ACTION_UPDATE_STATE';

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
    changeLanguage: () => (dispatch) => {
        ScratchBlocks.ScratchMsgs.setLocale(lng);
        this.props.vm.setLocale(lng, this.props.messages)
            .then(() => {
                ScratchBlocks.getMainWorkspace().getFlyout().setRecyclingEnabled(false);
                this.props.vm.refreshWorkspace();

                // setTimeout(() => {
                //     // this.updateToolbox();
                //     console.log("###this.props.vm.refreshWorkspace();")
                //     this.props.vm.refreshWorkspace();
                //     // this.workspace.getFlyout().setRecyclingEnabled(true);
                //
                // }, 500);

                // this.requestToolboxUpdate();
                // this.withToolboxUpdates(() => {
                //     this.workspace.getFlyout().setRecyclingEnabled(true);
                // });
            });
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
