import _ from 'lodash';
import Model2D from "../containers/Model2D/Model2D.js";

const ACTION_UPDATE_STATE = 'laser/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    rendererParent: null,
    model: null, // the selected model
    config: null, // config of selected model
    transformation: null, // transformation of selected model
    working_parameters: null, // working_parameters of selected model
    modelCount: 0,
    isAllPreviewed: false, // whether all models are previewed
    gcode: null
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    setRendererParent: (object3d) => (dispatch) => {
        dispatch(actions._updateState({rendererParent: object3d}));
    },
    addModel: (model) => (dispatch, getState) => {
        const {rendererParent} = getState().laser;
        for (const child of rendererParent.children) {
            child.setSelected(false);
        }
        rendererParent.add(model);
        model.setSelected(true);

        const {config, transformation, working_parameters} = model;
        dispatch(actions._updateState({
            model,
            config,
            transformation,
            working_parameters,
            modelCount: rendererParent.children.length,
            isAllPreviewed: false,
            gcode: null
        }));

        model.addEventListener(Model2D.EVENT_TYPE_PREVIEWED, () => {
            console.log("EVENT_TYPE_PREVIEWED");
            let isAllPreviewed = true;
            for (let i = 0; i < rendererParent.children.length; i++) {
                const model = rendererParent.children[i];
                if (!model.isPreviewed) {
                    isAllPreviewed = false;
                    break;
                }
            }
            dispatch(actions._updateState({isAllPreviewed}));
        });

        model.addEventListener(Model2D.EVENT_TYPE_SELECTED, () => {
            console.log("EVENT_TYPE_SELECTED");
            const {rendererParent} = getState().laser;
            for (const child of rendererParent.children) {
                if (child !== model){
                    child.setSelected(false);
                }
            }
            const {config, transformation, working_parameters} = model;
            dispatch(actions._updateState({
                model,
                config,
                transformation,
                working_parameters
            }));
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_CONFIG, () => {
            console.log("EVENT_TYPE_CHANGED_CONFIG");
            dispatch(actions._updateState({
                config: _.cloneDeep(model.config),
                gcode: null
            }));
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_TRANSFORMATION, () => {
            console.log("EVENT_TYPE_CHANGED_TRANSFORMATION");
            dispatch(actions._updateState({
                transformation: _.cloneDeep(model.transformation),
                gcode: null
            }));
        });

        model.addEventListener(Model2D.EVENT_TYPE_CHANGED_WORKING_PARAMETERS, () => {
            console.log("EVENT_TYPE_CHANGED_WORKING_PARAMETERS");
            dispatch(actions._updateState({
                working_parameters: _.cloneDeep(model.working_parameters),
                gcode: null
            }));
        });

        model.preview();
    },
    removeSelected: () => (dispatch, getState) => {
        if (!getState().laser.model) {
            return {type: null};
        }

        const {rendererParent} = getState().laser;
        rendererParent.remove(getState().laser.model);
        dispatch(actions._updateState({
            model: null,
            config: null,
            transformation: null,
            working_parameters: null,
            modelCount: rendererParent.children.length,
            gcode: null
        }));
    },
    removeAll: () => (dispatch, getState) => {
        const {rendererParent} = getState().laser;
        rendererParent.remove(...rendererParent.children);
        dispatch(actions._updateState({
            model: null,
            config: null,
            transformation: null,
            working_parameters: null,
            modelCount: 0,
            gcode: null
        }));
    },
    duplicateSelected: () => {
        return {type: null};
    },
    undo: () => {
        return {type: null};
    },
    redo: () => {
        return {type: null};
    },
    //g-code
    generateGcode: () => (dispatch, getState) => {
        const {rendererParent} = getState().laser;
        const gcodeArr = [];
        for (let i = 0; i < rendererParent.children.length; i++) {
            const model = rendererParent.children[i];
            gcodeArr.push(model.generateGcode());
        }
        const gcode = gcodeArr.join('\n');
        dispatch(actions._updateState({gcode}));
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
