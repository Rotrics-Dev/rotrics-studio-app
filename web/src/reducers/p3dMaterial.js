import p3dMaterialManager from "../containers/p3d/lib/p3dMaterialManager";

const SET_MATERIALS = 'p3dMaterial/SET_MATERIALS';
const SET_NAME = 'p3dMaterial/SET_NAME';

const INITIAL_STATE = {
    materials: [], //所有material
    name: null,
};

const getByName = (materials, name) => {
    for (let i = 0; i < materials.length; i++) {
        const item = materials[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

export const actions = {
    init: () => (dispatch) => {
        p3dMaterialManager.on("onMaterialsChange", (materials) => {
            dispatch(actions._setMaterials(materials));
        });
        p3dMaterialManager.on("onSelectedChange", (name) => {
            dispatch(actions._setName(name));
        });
    },
    fetchAll: () => {
        p3dMaterialManager.fetchAll();
        return {type: null};
    },
    update: (key, value) => {
        p3dMaterialManager.update(key, value);
        return {type: null};
    },
    rename: (newName) => {
        p3dMaterialManager.rename(newName);
        return {type: null};
    },
    delete: (name) => {
        p3dMaterialManager.delete(name);
        return {type: null};
    },
    clone: (name) => {
        p3dMaterialManager.clone(name);
        return {type: null};
    },
    select: (name) => {
        p3dMaterialManager.select(name);
        return {type: null};
    },
    _setMaterials: (materials) => {
        return {
            type: SET_MATERIALS,
            value: materials
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
        case SET_MATERIALS:
            return Object.assign({}, state, {materials: action.value});
        case SET_NAME:
            return Object.assign({}, state, {name: action.value});
        default:
            return state;
    }
}
