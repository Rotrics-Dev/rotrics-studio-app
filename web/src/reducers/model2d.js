import _ from 'lodash';
import * as THREE from 'three';
import Model2D from "../containers/Model2D/Model2D.js";

const ACTION_UPDATE_STATE = 'model2d/ACTION_UPDATE_STATE';

//TODO: use immutable
const INITIAL_STATE = {
    modelParentLaser: new THREE.Group(),
    modelLaser: null, // the selected model
    configLaser: null, // config of selected model
    transformationLaser: null, // transformation of selected model
    workingParametersLaser: null, // working_parameters of selected model
    modelCountLaser: 0,
    isAllPreviewedLaser: false, // whether all models are previewed
    gcodeLaser: null,

    modelParentWriteDraw: new THREE.Group(),
    modelWriteDraw: null, // the selected model
    configWriteDraw: null, // config of selected model
    transformationWriteDraw: null, // transformation of selected model
    workingParametersWriteDraw: null, // working_parameters of selected model
    modelCountWriteDraw: 0,
    isAllPreviewedWriteDraw: false, // whether all models are previewed
    gcodeWriteDraw: null,
};

const getModelParent = (front_end, getState) => {
    switch (front_end) {
        case "laser":
            return getState().model2d.modelParentLaser;
        case "write_draw":
            return getState().model2d.modelParentWriteDraw;
    }
    return null;
};

const getModel = (front_end, getState) => {
    switch (front_end) {
        case "laser":
            return getState().model2d.modelLaser;
        case "write_draw":
            return getState().model2d.modelWriteDraw;
    }
    return null;
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    addModel: (front_end, model) => (dispatch, getState) => {
        const modelParent = getModelParent(front_end, getState);

        model.setSelected(true);
        model.preview();
        modelParent.add(model);
        for (const child of modelParent.children) {
            if (child !== model) {
                child.setSelected(false);
            }
        }

        const {config, transformation, working_parameters} = model;
        switch (front_end) {
            case "laser":
                dispatch(actions._updateState({
                    modelLaser: model,
                    configLaser: config,
                    transformationLaser: transformation,
                    workingParametersLaser: working_parameters,
                    modelCountLaser: modelParent.children.length,
                    isAllPreviewedLaser: false,
                    gcodeLaser: null
                }));
                break;
            case "write_draw":
                dispatch(actions._updateState({
                    modelWriteDraw: model,
                    configWriteDraw: config,
                    transformationWriteDraw: transformation,
                    workingParametersWriteDraw: working_parameters,
                    modelCountWriteDraw: modelParent.children.length,
                    isAllPreviewedWriteDraw: false,
                    gcodeWriteDraw: null
                }));
                break;
        }

        model.addEventListener(Model2D.EVENT_TYPE_PREVIEWED, () => {
            console.log("EVENT_TYPE_PREVIEWED");
            const isAllPreviewed = modelParent.children.every((element) => {
                return !!element.toolPathLines; //TODO: use tool path lines
            });
            switch (front_end) {
                case "laser":
                    dispatch(actions._updateState({isAllPreviewedLaser: isAllPreviewed}));
                    break;
                case "write_draw":
                    dispatch(actions._updateState({isAllPreviewedWriteDraw: isAllPreviewed}));
                    break;
            }
        });

        model.addEventListener(Model2D.EVENT_TYPE_SELECTED, () => {
            console.log("EVENT_TYPE_SELECTED");
            for (const child of modelParent.children) {
                if (child !== model) {
                    child.setSelected(false);
                }
            }
            const {config, transformation, working_parameters} = model;
            switch (front_end) {
                case "laser":
                    dispatch(actions._updateState({
                        modelLaser: model,
                        configLaser: config,
                        transformationLaser: transformation,
                        workingParametersLaser: working_parameters
                    }));
                    break;
                case "write_draw":
                    dispatch(actions._updateState({
                        modelWriteDraw: model,
                        configWriteDraw: config,
                        transformationWriteDraw: transformation,
                        workingParametersWriteDraw: working_parameters
                    }));
                    break;
            }
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_CONFIG, () => {
            console.log("EVENT_TYPE_CHANGED_CONFIG");
            switch (front_end) {
                case "laser":
                    dispatch(actions._updateState({
                        configLaser: _.cloneDeep(config),
                        gcodeLaser: null
                    }));
                    break;
                case "write_draw":
                    dispatch(actions._updateState({
                        configWriteDraw: _.cloneDeep(config),
                        gcodeWriteDraw: null
                    }));
                    break;
            }
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_TRANSFORMATION, () => {
            console.log("EVENT_TYPE_CHANGED_TRANSFORMATION");
            switch (front_end) {
                case "laser":
                    dispatch(actions._updateState({
                        transformationLaser: _.cloneDeep(transformation),
                        gcodeLaser: null
                    }));
                    break;
                case "write_draw":
                    dispatch(actions._updateState({
                        transformationWriteDraw: _.cloneDeep(transformation),
                        gcodeWriteDraw: null
                    }));
                    break;
            }
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_WORKING_PARAMETERS, () => {
            console.log("EVENT_TYPE_CHANGED_WORKING_PARAMETERS: " + JSON.stringify(model.working_parameters, null, 2));
            switch (front_end) {
                case "laser":
                    dispatch(actions._updateState({
                        workingParametersLaser: _.cloneDeep(working_parameters),
                        gcodeLaser: null
                    }));
                    break;
                case "write_draw":
                    dispatch(actions._updateState({
                        workingParametersWriteDraw: _.cloneDeep(working_parameters),
                        gcodeWriteDraw: null
                    }));
                    break;
            }
        });
    },
    removeSelected: (front_end) => (dispatch, getState) => {
        const modelParent = getModelParent(front_end, getState);
        const model = getModel(front_end, getState);
        modelParent.remove(model);

        switch (front_end) {
            case "laser":
                dispatch(actions._updateState({
                    modelLaser: null,
                    configLaser: null,
                    transformationLaser: null,
                    workingParametersLaser: null,
                    modelCountLaser: modelParent.children.length,
                    gcodeLaser: null
                }));
                break;
            case "write_draw":
                dispatch(actions._updateState({
                    modelWriteDraw: null,
                    configWriteDraw: null,
                    transformationWriteDraw: null,
                    workingParametersWriteDraw: null,
                    modelCountWriteDraw: modelParent.children.length,
                    gcodeWriteDraw: null
                }));
                break;
        }
    },
    removeAll: (front_end) => (dispatch, getState) => {
        const modelParent = getModelParent(front_end, getState);
        modelParent.remove(...modelParent.children);

        switch (front_end) {
            case "laser":
                dispatch(actions._updateState({
                    modelLaser: null,
                    configLaser: null,
                    transformationLaser: null,
                    workingParametersLaser: null,
                    modelCountLaser: modelParent.children.length,
                    gcodeLaser: null
                }));
                break;
            case "write_draw":
                dispatch(actions._updateState({
                    modelWriteDraw: null,
                    configWriteDraw: null,
                    transformationWriteDraw: null,
                    workingParametersWriteDraw: null,
                    modelCountWriteDraw: modelParent.children.length,
                    gcodeWriteDraw: null
                }));
                break;
        }
    },
    //g-code
    generateGcode: (front_end) => (dispatch, getState) => {
        const modelParent = getModelParent(front_end, getState);
        const gcodeArr = [];
        for (let i = 0; i < modelParent.children.length; i++) {
            const model = modelParent.children[i];
            gcodeArr.push(model.generateGcode());
        }
        const gcode = gcodeArr.join('\n');

        switch (front_end) {
            case "laser":
                dispatch(actions._updateState({gcodeLaser: gcode}));
                break;
            case "write_draw":
                dispatch(actions._updateState({gcodeWriteDraw: gcode}));
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
