import socketClientManager from "../socket/socketClientManager";
import {P3D_SETTING_UPDATE, P3D_SETTING_FETCH_ALL} from "../constants";

const ACTION_UPDATE_STATE = 'p3dSettings/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    settings: [],
    name: null,
};

const _getAvailableOfficialName = (settings) => {
    for (let i = 0; i < settings.length; i++) {
        const item = settings[i];
        if (item.isOfficial && item.isDefault) {
            return item.name;
        }
    }
    return null;
};

const _getByName = (settings, name) => {
    for (let i = 0; i < settings.length; i++) {
        const item = settings[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

const _containName = (settings, name) => {
    for (let i = 0; i < settings.length; i++) {
        const item = settings[i];
        if (item.name === name) {
            return true;
        }
    }
    return false;
};

const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", () => {
            dispatch(actions.fetchAll());
        });

        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({
                name: null,
                settings: []
            }));
        });

        socketClientManager.addServerListener(P3D_SETTING_FETCH_ALL, (settings) => {
            //TODO: 判断是否有变化，有变化才emit
            if (!_containName(settings, getState().p3dSetting.name)) {
                const name = _getAvailableOfficialName(settings);
                dispatch(actions._updateState({
                    name,
                    settings
                }));
            } else {
                dispatch(actions._updateState({
                    settings
                }));
            }
        });
    },
    fetchAll: () => {
        socketClientManager.emitToServer(P3D_SETTING_FETCH_ALL);
        return {type: null};
    },
    update: (key, value) => (dispatch, getState) => {
        const {settings, name} = getState().p3dSetting;

        const keys = key.split('.');
        if (keys.length !== 3) {
            console.error("keys.length !== 3");
            return {type: null};
        }

        const setting = _getByName(settings, name);
        if (!setting) {
            console.error("setting is null");
            return {type: null};
        }

        //更新内存
        setting[keys[0]][keys[1]][keys[2]] = value;
        //更新server
        socketClientManager.emitToServer(P3D_SETTING_UPDATE, {name, key, value});

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
    select: (newName) => (dispatch, getState) => {
        const {settings, name} = getState().p3dSetting;

        if (!_containName(settings, name)) {
            console.error("name is not contained");
            return;
        }

        if (newName !== name) {
            dispatch(actions._updateState({name: newName}));
        } else {
            return {type: null};
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

