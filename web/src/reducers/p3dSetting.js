import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import {P3D_SETTING_UPDATE, P3D_SETTING_FETCH} from "../constants";

const ACTION_UPDATE_STATE = 'p3dSettings/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    settings: [], //all settings
    setting: null, //the selected setting
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
                setting: null
            }));
        });
        socketClientManager.addServerListener(P3D_SETTING_FETCH, (settings) => {
            let {setting} = getState().p3dSetting;
            if (!setting) {
                for (let i = 0; i < settings.length; i++) {
                    const item = settings[i];
                    if (item.isSelected) {
                        setting = item;
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
                setting
            }));
        });
    },
    fetch: () => {
        socketClientManager.emitToServer(P3D_SETTING_FETCH);
        return {type: null};
    },
    /**
     * update value of the selected setting
     * @param keyChain example: material_flow.default_value
     * @param value
     */
    update: (keyChain, value) => (dispatch, getState) => {
        const {settings, setting} = getState().p3dSetting;
        if (!setting || !settings || settings.length === 0) {
            console.error("settings or setting is null");
            return {type: null};
        }
        _.set(setting, keyChain, value);
        //更新server
        const {filename} = setting;
        socketClientManager.emitToServer(P3D_SETTING_UPDATE, {filename, keyChain, value});
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
        const {settings, setting} = getState().p3dSetting;
        let settingSelected = null;
        for (let i = 0; i < settings.length; i++) {
            const item = settings[i];
            if (item.name === name) {
                settingSelected = item;
                break;
            }
        }
        if (setting === settingSelected) {
            return {type: null};
        } else {
            dispatch(actions._updateState({setting: settingSelected}));
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

