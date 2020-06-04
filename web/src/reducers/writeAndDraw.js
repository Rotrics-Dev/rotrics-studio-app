import _ from 'lodash';
import writeAndDrawManager from "../containers/writeAndDraw/lib/writeAndDrawManager";

const SET_MODEL = 'writeAndDraw/SET_MODEL';
const SET_TRANSFORMATION = 'writeAndDraw/SET_TRANSFORMATION';
const SET_CONFIG = 'writeAndDraw/SET_CONFIG';
const SET_WORKING_PARAMETERS = 'writeAndDraw/SET_WORKING_PARAMETERS';

const SET_ALL_PREVIEWED = 'writeAndDraw/SET_ALL_PREVIEWED';
const SET_GCODE = 'writeAndDraw/SET_GCODE';
const SET_MODEL_COUNT = 'writeAndDraw/SET_MODEL_COUNT';

const SELECT_MODEL = 'writeAndDraw/SELECT_MODEL';

const INITIAL_STATE = {
    modelCount: 0,
    isAllPreviewed: false, //是否所有model全部previewed
    gcode: "",
    model: null,
    transformation: null,
    config: null,
    working_parameters: null
};

export const actions = {
    init: () => (dispatch) => {
        writeAndDrawManager.on("onChangeModel", (model2d) => {
            console.log("writeAndDrawText_onChangeModel_ON"+JSON.stringify(model2d))

            dispatch(actions._setModelCount(writeAndDrawManager.modelsParent.children.length));
            dispatch(actions._selectModel(model2d));
        });
        writeAndDrawManager.on("onChangeTransformation", (transformation) => {
            dispatch(actions._setTransformation(_.cloneDeep(transformation)));
        });
        writeAndDrawManager.on("onChangeConfig", (config) => {
            dispatch(actions._setConfig(_.cloneDeep(config)));
        });
        writeAndDrawManager.on("onChangeWorkingParameters", (working_parameters) => {
            dispatch(actions._setWorkingParameters(_.cloneDeep(working_parameters)));
        });
        writeAndDrawManager.on("onPreviewStatusChange", (isAllPreviewed) => {
            console.log("onPreviewStatusChange => " + isAllPreviewed)
            dispatch(actions._setAllPreviewed(isAllPreviewed));
        });
    },
    //modelsParent: three.Object3D
    setModelsParent: (modelsParent) => {
        writeAndDrawManager.setModelsParent(modelsParent);
        return {type: null};
    },
    //model
    addModel: (model) => {
        writeAndDrawManager.addModel(model);
        return {type: null};
    },
    selectModel: (model) => {
        writeAndDrawManager.selectModel(model);
        return {type: null};
    },
    removeSelected: () => {
        writeAndDrawManager.removeSelected();
        return {type: null};
    },
    removeAll: () => {
        writeAndDrawManager.removeAll();
        return {type: null};
    },
    duplicateSelected: () => {
        writeAndDrawManager.duplicateSelected();
        return {type: null};
    },
    undo: () => {
        console.log("undo")
        return {type: null};
    },
    redo: () => {
        console.log("redo")
        return {type: null};
    },
    //update settings
    updateTransformation: (key, value, preview) => {
        writeAndDrawManager.updateTransformation(key, value, preview);
        return {type: null};
    },
    updateConfig: (key, value) => {
        writeAndDrawManager.updateConfig(key, value);
        return {type: null};
    },
    updateWorkingParameters: (key, value) => {
        writeAndDrawManager.updateWorkingParameters(key, value);
        return {type: null};
    },
    _setModelCount: (count) => {
        return {
            type: SET_MODEL_COUNT,
            value: count
        };
    },
    //set settings/model
    _setModel: (model) => {
        return {
            type: SET_MODEL,
            value: model
        };
    },
    _setTransformation: (transformatione) => {
        return {
            type: SET_TRANSFORMATION,
            value: transformatione
        };
    },
    _setConfig: (config) => {
        return {
            type: SET_CONFIG,
            value: config
        };
    },
    _setWorkingParameters: (workingParameters) => {
        return {
            type: SET_WORKING_PARAMETERS,
            value: workingParameters
        };
    },
    _setAllPreviewed: (isAllPreviewed) => {
        return {
            type: SET_ALL_PREVIEWED,
            value: isAllPreviewed
        };
    },
    _selectModel: (model) => {
        return {
            type: SELECT_MODEL,
            value: model
        };
    },
    //g-code
    generateGcode: () => {
        const gcode = writeAndDrawManager.generateGcode();
        return {
            type: SET_GCODE,
            value: gcode
        };
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_MODEL:
            return Object.assign({}, state, {model: action.value, gcode: ""});
        case SET_TRANSFORMATION:
            return Object.assign({}, state, {transformation: action.value, gcode: ""});
        case SET_CONFIG:
            return Object.assign({}, state, {config: action.value, gcode: ""});
        case SET_WORKING_PARAMETERS:
            return Object.assign({}, state, {working_parameters: action.value, gcode: ""});
        case SET_ALL_PREVIEWED:
            return Object.assign({}, state, {isAllPreviewed: action.value, gcode: ""});
        case SET_GCODE:
            return Object.assign({}, state, {gcode: action.value});
        case SET_MODEL_COUNT:
            return Object.assign({}, state, {modelCount: action.value, gcode: ""});
        case SELECT_MODEL:
            const model = action.value;
            if (model) {
                const {transformation, config, working_parameters} = model.settings;
                return Object.assign({}, state, {model, transformation, config, working_parameters});
            } else {
                return Object.assign({}, state, {
                    model: null,
                    transformation: null,
                    config: null,
                    working_parameters: null
                });
            }
        default:
            return state;
    }
}
