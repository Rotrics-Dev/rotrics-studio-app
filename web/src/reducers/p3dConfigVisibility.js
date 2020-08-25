const ACTION_UPDATE_STATE = 'p3dConfigVisibility/ACTION_UPDATE_STATE';

const CONFIG_OTHERS_PARAMETER_ALL = null;
const CONFIG_OTHERS_PARAMETER_BASIC = [
    //resolution
    "resolution.children.layer_height",
    "resolution.children.layer_height_0",
    "resolution.children.line_width",

    "resolution.children.line_width.children.wall_line_width.children.wall_line_width_0",
    "resolution.children.line_width.children.wall_line_width.children.wall_line_width_x",
];

const CONFIG_MATERIAL_PARAMETER_ALL = null;
const CONFIG_MATERIAL_PARAMETER_BASIC = [
    "material.children.default_material_print_temperature",
    "material.children.build_volume_temperature",
    "material.children.material_print_temperature",
    "material.children.material_print_temperature_layer_0",

    "material.children.material_flow",
    "material.children.material_flow.children.wall_material_flow",
    "material.children.material_flow.children.wall_material_flow.children.wall_0_material_flow",
];

const INITIAL_STATE = {
    visibility: "Basic", //Basic, All
    configOthersParameter: CONFIG_OTHERS_PARAMETER_BASIC,
    configMaterialParameter: CONFIG_MATERIAL_PARAMETER_BASIC
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    changeVisibility: (visibility) => (dispatch) => {
        switch (visibility) {
            case "Basic":
                dispatch(actions._updateState({
                    visibility,
                    configOthersParameter: CONFIG_OTHERS_PARAMETER_BASIC,
                    configMaterialParameter: CONFIG_MATERIAL_PARAMETER_BASIC
                }));
                break;
            case "All":
                dispatch(actions._updateState({
                    visibility,
                    configOthersParameter: CONFIG_OTHERS_PARAMETER_ALL,
                    configMaterialParameter: CONFIG_MATERIAL_PARAMETER_ALL
                }));
                break;
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

