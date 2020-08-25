const ACTION_UPDATE_STATE = 'p3dConfigVisibility/ACTION_UPDATE_STATE';

const CATEGORY_BASIC = ["resolution", "shell", "infill"];
const PARAMETER_BASIC = [
    "resolution.layer_height", "resolution.layer_height_0",
    "resolution.line_width", "resolution.line_width.wall_line_width.wall_line_width_0", "resolution.line_width.wall_line_width.wall_line_width_x",
    "resolution.layer_height",
    "shell",
    "infill"];

const CATEGORY_ALL = [
    "resolution",
    "shell",
    "infill",
    // "material",
    "speed",
    "travel",
    "cooling",
    "support",
    "platform_adhesion",
    "dual",
    "meshfix",
    "blackmagic",
    "experimental"
];
const PARAMETER_ALL = [];

const INITIAL_STATE = {
    visibility: "Basic", //Basic, All
    category: CATEGORY_BASIC,
    parameter: PARAMETER_BASIC
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
                    category: CATEGORY_BASIC,
                    parameter: PARAMETER_BASIC
                }));
                break;
            case "All":
                dispatch(actions._updateState({
                    visibility,
                    category: CATEGORY_ALL,
                    parameter: PARAMETER_ALL
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

