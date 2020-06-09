import p3dSettingManager from "../containers/p3d/lib/p3dSettingManager";

const SET_SETTINGS = 'p3dSetting/SET_SETTINGS';
const SET_NAME = 'p3dSetting/SET_NAME';

const INITIAL_STATE = {
    settings: [],
    name: null,
};

const getByName = (configs, name) => {
    for (let i = 0; i < configs.length; i++) {
        const item = configs[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

export const actions = {
    init: () => (dispatch) => {
        p3dSettingManager.on("onSettingsChange", (settings) => {
            dispatch(actions._setSettings(settings));
        });
        p3dSettingManager.on("onSelectedChange", (name) => {
            dispatch(actions._setName(name));
        });
    },
    fetchAll: () => {
        p3dSettingManager.fetchAll();
        return {type: null};
    },
    update: (key, value) => {
        p3dSettingManager.update(key, value);
        return {type: null};
    },
    rename: (newName) => {
        p3dSettingManager.rename(newName);
        return {type: null};
    },
    delete: (name) => {
        p3dSettingManager.delete(name);
        return {type: null};
    },
    clone: (name) => {
        p3dSettingManager.clone(name);
        return {type: null};
    },
    select: (name) => {
        p3dSettingManager.select(name);
        return {type: null};
    },
    _setSettings: (settings) => {
        return {
            type: SET_SETTINGS,
            value: settings
        };
    },
    _setName: (name) => {
        return {
            type: SET_NAME,
            value: name
        };
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_SETTINGS:
            return Object.assign({}, state, {settings: action.value});
        case SET_NAME:
            return Object.assign({}, state, {name: action.value});
        default:
            return state;
    }
}
