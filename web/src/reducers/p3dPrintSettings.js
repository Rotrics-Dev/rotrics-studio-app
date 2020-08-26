import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import {P3D_CONFIG_PRINT_SETTING_UPDATE, P3D_CONFIG_PRINT_SETTINGS_FETCH} from "../constants";

const ACTION_UPDATE_STATE = 'p3dPrintSettings/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    settings: [],
    selected: null,
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", () => {
            dispatch(actions.fetch());
        });
        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({
                settings: [],
                selected: null
            }));
        });
        socketClientManager.addServerListener(P3D_CONFIG_PRINT_SETTINGS_FETCH, (settings) => {
            let {selected} = getState().p3dPrintSettings;
            if (!selected) {
                for (let i = 0; i < settings.length; i++) {
                    const item = settings[i];
                    if (item.isDefaultSelected) {
                        selected = item;
                        break;
                    }
                }
            }
            //Official放在前面
            settings.sort((a, b) => {
                if (a.isOfficial && !b.isOfficial) {
                    return -1;
                }
                if (!a.isOfficial && b.isOfficial) {
                    return 1;
                }
                //a.isOfficial && b.isOfficial or !a.isOfficial && !b.isOfficial
                return 0;
            });
            dispatch(actions._updateState({
                settings,
                selected
            }));
        });
    },
    fetch: () => {
        socketClientManager.emitToServer(P3D_CONFIG_PRINT_SETTINGS_FETCH);
        return {type: null};
    },
    /**
     * update value of the selected setting
     * @param keyChain example: material_flow.default_value
     * @param value
     */
    update: (keyChain, value) => (dispatch, getState) => {
        const {settings, selected} = getState().p3dPrintSettings;
        if (!settings || settings.length === 0 || !selected) {
            console.error("config is null");
            return {type: null};
        }
        _.set(selected, keyChain, value);
        //更新server
        const {filename} = selected;
        socketClientManager.emitToServer(P3D_CONFIG_PRINT_SETTING_UPDATE, {filename, keyChain, value});
        return {type: null};
    },
    rename: (newName) => {
        return {type: null};
    },
    delete: (name) => {
        return {type: null};
    },
    clone: (name) => {
        return {type: null};
    },
    select: (name) => (dispatch, getState) => {
        const {settings,  selected} = getState().p3dPrintSettings;
        let selectedNew = null;
        for (let i = 0; i < settings.length; i++) {
            const item = settings[i];
            if (item.name === name) {
                selectedNew = item;
                break;
            }
        }
        if (selected === selectedNew) {
            return {type: null};
        } else {
            dispatch(actions._updateState({selected: selectedNew}));
        }
    }
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
};

export {actions};
export default reducer;

