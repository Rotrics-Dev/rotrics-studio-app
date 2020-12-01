import _ from 'lodash';

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

        model.addEventListener('preview', (event) => {
            const {isPreviewed} = event.data;
            if (!isPreviewed) {
                dispatch(actions._updateState({isAllPreviewed: false}));
            } else {
                let isAllPreviewed = true;
                for (let i = 0; i < rendererParent.children.length; i++) {
                    const model = rendererParent.children[i];
                    if (!model.isPreviewed) {
                        isAllPreviewed = false;
                        break;
                    }
                }
                dispatch(actions._updateState({isAllPreviewed}));
            }
        });

        model.preview();
    },

    selectModel: (model) => (dispatch, getState) => {
        if (model === getState().laser.model) {
            return {type: null};
        }

        const {rendererParent} = getState().laser;
        for (const child of rendererParent.children) {
            child.setSelected(false);
        }
        model.setSelected(true);

        const {config, transformation, working_parameters} = model;
        dispatch(actions._updateState({
            model,
            config,
            transformation,
            working_parameters
        }));
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
    //TODO: 比较前后settings是否变化；不变则不更新数据
    updateTransformation: (key, value, preview) => (dispatch, getState) => {
        const {model} = getState().laser;
        if (model.updateTransformation(key, value, preview)) {
            dispatch(actions._updateState({
                transformation: _.cloneDeep(model.transformation),
                gcode: null
            }));
        } else {
            return {type: null};
        }
    },
    updateConfig: (key, value) => async (dispatch, getState) => {
        const {model} = getState().laser;
        if (await model.updateConfig(key, value)) {
            // updateConfig may will change transformation
            dispatch(actions._updateState({
                config: _.cloneDeep(model.config),
                transformation: _.cloneDeep(model.transformation),
                isAllPreviewed: false,
                gcode: null
            }));
        } else {
            return {type: null};
        }
    },
    updateWorkingParameters: (key, value) => (dispatch, getState) => {
        const {model} = getState().laser;
        if (model.updateWorkingParameters(key, value)) {
            dispatch(actions._updateState({
                working_parameters: _.cloneDeep(model.working_parameters),
                gcode: null
            }));
        } else {
            return {type: null};
        }
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
