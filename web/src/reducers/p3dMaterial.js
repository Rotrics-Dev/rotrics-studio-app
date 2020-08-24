import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import {P3D_MATERIAL_FETCH, P3D_MATERIAL_UPDATE} from "../constants";

const ACTION_UPDATE_STATE = 'p3dMaterial/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    materials: [], //all materials
    material: null, //the selected material
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
                material: null
            }));
        });
        socketClientManager.addServerListener(P3D_MATERIAL_FETCH, (materials) => {
            let {material} = getState().p3dMaterial;
            if (!material) {
                for (let i = 0; i < materials.length; i++) {
                    const item = materials[i];
                    if (item.isSelected) {
                        material = item;
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
                material
            }));
        });
    },
    fetch: () => {
        socketClientManager.emitToServer(P3D_MATERIAL_FETCH);
        return {type: null};
    },
    /**
     * update value of the selected material
     * @param keyChain example: material_flow.default_value
     * @param value
     */
    update: (keyChain, value) => (dispatch, getState) => {
        const {materials, material} = getState().p3dMaterial;
        if (!material || !materials || materials.length === 0) {
            console.error("material or materials is null");
            return {type: null};
        }
        _.set(material, keyChain, value);
        //更新server
        const {filename} = material;
        socketClientManager.emitToServer(P3D_MATERIAL_UPDATE, {filename, keyChain, value});
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
        console.log("selected: " + name)
        const {materials, material} = getState().p3dMaterial;
        let materialSelected = null;
        for (let i = 0; i < materials.length; i++) {
            const item = materials[i];
            if (item.name === name) {
                materialSelected = item;
                break;
            }
        }
        if (material === materialSelected) {
            return {type: null};
        } else {
            dispatch(actions._updateState({material: materialSelected}));
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
