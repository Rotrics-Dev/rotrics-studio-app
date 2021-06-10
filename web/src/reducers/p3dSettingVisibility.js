const ACTION_UPDATE_STATE = 'p3dSettingVisibility/ACTION_UPDATE_STATE';
1
const MATERIAL_SETTINGS_ALL = [
    "infill.children.infill_sparse_density.children.infill_line_distance"
];
const MATERIAL_SETTINGS_BASIC = [
    "material.children.material_print_temperature",
    "material.children.material_print_temperature_layer_0",
    "material.children.material_final_print_temperature",
    "material.children.material_print_temperature_layer_0",

    "material.children.material_flow",
    "material.children.material_flow.children.wall_material_flow",
    "material.children.material_flow.children.wall_material_flow.children.wall_0_material_flow",
    "material.children.material_flow.children.wall_material_flow.children.wall_x_material_flow",
    "material.children.material_flow_layer_0",
];

const PRINT_SETTINGS_ALL = null;
const PRINT_SETTINGS_BASIC = [
    //resolution
    "resolution.children.layer_height",
    "resolution.children.layer_height_0",
    "resolution.children.line_width",
    "resolution.children.line_width.children.wall_line_width",
    "resolution.children.line_width.children.wall_line_width.children.wall_line_width_0",
    "resolution.children.line_width.children.wall_line_width.children.wall_line_width_0",
    "resolution.children.line_width.children.wall_line_width.children.wall_line_width_x",
    "resolution.children.initial_layer_line_width_factor",

    //shell
    "shell.children.wall_thickness",
    "shell.children.wall_thickness.children.wall_line_count",
    "shell.children.top_bottom_thickness",
    "shell.children.top_bottom_thickness.children.top_thickness",
    "shell.children.top_bottom_thickness.children.top_thickness.children.top_layers",
    "shell.children.top_bottom_thickness.children.bottom_thickness",
    "shell.children.top_bottom_thickness.children.bottom_thickness.children.bottom_layers",
    "shell.children.top_bottom_thickness.children.bottom_thickness.children.initial_bottom_layers",

    //infill
    "infill.children.infill_sparse_density",
    "infill.children.infill_sparse_density.children.infill_line_distance",
    "infill.children.infill_pattern",

    //speed
    "speed.children.speed_print",
    "speed.children.speed_print.children.speed_infill",
    "speed.children.speed_print.children.speed_wall",
    "speed.children.speed_print.children.speed_wall.children.speed_wall_0",
    "speed.children.speed_print.children.speed_wall.children.speed_wall_x",
    "speed.children.speed_print.children.speed_roofing",
    "speed.children.speed_print.children.speed_topbottom",
    "speed.children.speed_travel",
    "speed.children.speed_layer_0",
    "speed.children.speed_layer_0.children.speed_print_layer_0",
    "speed.children.speed_layer_0.children.speed_travel_layer_0",

    //travel
    "travel.children.retraction_enable",
    "travel.children.retract_at_layer_change",
    "travel.children.retraction_amount",
    "travel.children.retraction_speed",
    "travel.children.retraction_speed.children.retraction_retract_speed",
    "travel.children.retraction_speed.children.retraction_prime_speed",

    //support
    "support.children.support_enable",
    "support.children.support_type",
    "support.children.support_pattern",

    //platform_adhesion
    "platform_adhesion.children.prime_blob_enable",
    "platform_adhesion.children.adhesion_type",

    //blackmagic
    "blackmagic.children.magic_mesh_surface_mode",
    "blackmagic.children.magic_spiralize",
    "blackmagic.children.smooth_spiralized_contours"
];

const PRINT_SETTINGS_CATEGORY_ALL = [
    "resolution",
    "shell",
    "infill",
    // "material",
    "speed",
    "travel",
    "cooling",
    "support",
    "platform_adhesion",
    // "dual",
    "meshfix",
    "blackmagic",
    "experimental"
];
const PRINT_SETTINGS_CATEGORY_BASIC = [
    "resolution",
    "shell",
    "infill",
    // "material",
    "speed",
    "travel",
    // "cooling",
    "support",
    "platform_adhesion",
    // "dual",
    // "meshfix",
    "blackmagic",
    // "experimental"
];

const INITIAL_STATE = {
    visibility: "All", //Basic, All
    materialSettingsFilter: MATERIAL_SETTINGS_ALL,
    printSettingsFilter: PRINT_SETTINGS_ALL,
    printSettingsCategoryFilter: PRINT_SETTINGS_CATEGORY_ALL
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
                    materialSettingsFilter: MATERIAL_SETTINGS_BASIC,
                    printSettingsFilter: PRINT_SETTINGS_BASIC,
                    printSettingsCategoryFilter: PRINT_SETTINGS_CATEGORY_BASIC
                }));
                break;
            case "All":
                dispatch(actions._updateState({
                    visibility,
                    materialSettingsFilter: MATERIAL_SETTINGS_ALL,
                    printSettingsFilter: PRINT_SETTINGS_ALL,
                    printSettingsCategoryFilter: PRINT_SETTINGS_CATEGORY_ALL
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

