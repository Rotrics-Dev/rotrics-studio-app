import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import {P3D_CONFIG_OTHERS_UPDATE, P3D_CONFIG_OTHERS_FETCH} from "../constants";

const ACTION_UPDATE_STATE = 'p3dConfigOthers/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    configs: [],
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
                configs: [],
                selected: null
            }));
        });
        socketClientManager.addServerListener(P3D_CONFIG_OTHERS_FETCH, (configs) => {
            let {selected} = getState().p3dConfigOthers;
            if (!selected) {
                for (let i = 0; i < configs.length; i++) {
                    const item = configs[i];
                    if (item.isDefaultSelected) {
                        selected = item;
                        break;
                    }
                }
            }
            //Official放在前面
            configs.sort((a, b) => {
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
                configs,
                selected
            }));
        });
    },
    fetch: () => {
        socketClientManager.emitToServer(P3D_CONFIG_OTHERS_FETCH);
        return {type: null};
    },
    /**
     * update value of the selected setting
     * @param keyChain example: material_flow.default_value
     * @param value
     */
    update: (keyChain, value) => (dispatch, getState) => {
        const {configs, selected} = getState().p3dConfigOthers;
        if (!configs || configs.length === 0 || !selected) {
            console.error("config is null");
            return {type: null};
        }
        _.set(selected, keyChain, value);
        //更新server
        const {filename} = selected;
        socketClientManager.emitToServer(P3D_CONFIG_OTHERS_UPDATE, {filename, keyChain, value});
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
        const {configs,  selected} = getState().p3dConfigOthers;
        let selectedNew = null;
        for (let i = 0; i < configs.length; i++) {
            const item = configs[i];
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

