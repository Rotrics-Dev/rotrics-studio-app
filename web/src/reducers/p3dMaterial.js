import socketClientManager from "../socket/socketClientManager";
import {P3D_MATERIAL_FETCH_ALL, P3D_MATERIAL_UPDATE} from "../constants";

const ACTION_UPDATE_STATE = 'p3dMaterial/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    materials: [], //所有material
    name: null, //选中的material的name
};

const _getAvailableOfficialName = (materials) => {
    for (let i = 0; i < materials.length; i++) {
        const item = materials[i];
        if (item.isOfficial) {
            return item.name;
        }
    }
    return null;
};

const _getByName = (materials, name) => {
    for (let i = 0; i < materials.length; i++) {
        const item = materials[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

const _containName = (materials, name) => {
    for (let i = 0; i < materials.length; i++) {
        const item = materials[i];
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
                materials: []
            }));
        });
        socketClientManager.addServerListener(P3D_MATERIAL_FETCH_ALL, (materials) => {
            //TODO: 判断是否有变化，有变化才emit
            if (!_containName(materials, getState().p3dMaterial.name)) {
                const name = _getAvailableOfficialName(materials);
                dispatch(actions._updateState({
                    name,
                    materials
                }));
            } else {
                dispatch(actions._updateState({
                    materials
                }));
            }
        });
    },
    fetchAll: () => {
        socketClientManager.emitToServer(P3D_MATERIAL_FETCH_ALL);
        return {type: null};
    },
    /**
     * @param key 例子: overrides.material_flow.default_value 或 name
     * @param value
     */
    update: (key, value) => (dispatch, getState) => {
        const {materials, name} = getState().p3dMaterial;

        const keys = key.split('.');
        if (keys.length !== 3) {
            console.error("keys.length !== 3");
            return {type: null};
        }

        const material = _getByName(materials, name);
        if (!material) {
            console.error("material is null");
            return {type: null};
        }

        //更新内存
        material[keys[0]][keys[1]][keys[2]] = value;
        //更新server
        socketClientManager.emitToServer(P3D_MATERIAL_UPDATE, {name, key, value});

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
        const {materials, name} = getState().p3dMaterial;

        if (!_containName(materials, name)) {
            console.error("name is not contained");
            return;
        }

        if (newName !== name) {
            dispatch(actions._updateState({name: newName}));
        } else {
            return {type: null};
        }
    },
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
