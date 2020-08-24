import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import {P3D_CONFIG_MATERIAL_FETCH, P3D_CONFIG_MATERIAL_UPDATE} from "../constants";

const ACTION_UPDATE_STATE = 'p3dConfigMaterial/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    materials: [],
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
                materials: [],
                selected: null
            }));
        });
        socketClientManager.addServerListener(P3D_CONFIG_MATERIAL_FETCH, (materials) => {
            let {selected} = getState().p3dConfigMaterial;
            if (!selected) {
                for (let i = 0; i < materials.length; i++) {
                    const item = materials[i];
                    if (item.isDefaultSelected) {
                        selected = item;
                        break;
                    }
                }
            }
            //Official放在前面
            materials.sort((a, b) => {
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
                materials,
                selected
            }));
        });
    },
    fetch: () => {
        socketClientManager.emitToServer(P3D_CONFIG_MATERIAL_FETCH);
        return {type: null};
    },
    /**
     * update value of the selected material
     * @param keyChain example: material_flow.default_value
     * @param value
     */
    update: (keyChain, value) => (dispatch, getState) => {
        const {materials, selected} = getState().p3dConfigMaterial;
        if (!materials || materials.length === 0 || !selected) {
            console.error("config materials is null");
            return {type: null};
        }
        _.set(selected, keyChain, value);
        //更新server
        const {filename} = selected;
        socketClientManager.emitToServer(P3D_CONFIG_MATERIAL_UPDATE, {filename, keyChain, value});
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
        const {materials, selected} = getState().p3dConfigMaterial;
        let selectedNew = null;
        for (let i = 0; i < materials.length; i++) {
            const item = materials[i];
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
