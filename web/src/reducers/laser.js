import _ from 'lodash';
import {generateSvg, uploadImage} from "../api";

const ACTION_UPDATE_STATE = 'laser/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    rendererParent: null,
    model: null, // the selected model
    config: null,
    transformation: null,
    working_parameters: null,
    modelCount: 0,
    isAllPreviewed: false, // 是否所有model全部previewed
    gcode: null
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    setRendererParent: (object3d) => (dispatch) => {
        dispatch(actions._updateState({rendererParent: object3d}));
    },
    addModel: (model) => async (dispatch, getState) => {
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
        const selected = getState().laser.model;
        const {rendererParent} = getState().laser;
        if (model === selected) {
            return {type: null};
        }

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
        const selected = getState().laser.model;
        const {rendererParent} = getState().laser;
        if (!selected) {
            return {type: null};
        }

        rendererParent.remove(selected);
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
        if (rendererParent.children.length === 0) {
            return {type: null};
        }
        rendererParent.remove(...rendererParent.children);
        dispatch(actions._updateState({
            model: null,
            config: null,
            transformation: null,
            working_parameters: null,
            modelCount: rendererParent.children.length,
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
        model.updateTransformation(key, value, preview);
        dispatch(actions._updateState({
            transformation: _.cloneDeep(model.transformation),
            gcode: null
        }));
    },
    updateConfig: (key, value) => async (dispatch, getState) => {
        const {model} = getState().laser;
        switch (model.fileType) {
            case "text":
                model.updateConfig(key, value);
                const svg = await generateSvg(config_text);
                const filename = "text.svg";
                const blob = new Blob([svg], {type: 'text/plain'});
                const file = new File([blob], filename);

                const response = await uploadImage(file);
                const {url, width, height} = response;
                model.loadImg(url, width, height);
                model.preview();

                dispatch(actions._updateState({
                    config: _.cloneDeep(model.config),
                    transformation: _.cloneDeep(model.transformation),
                    isAllPreviewed: false,
                    gcode: null
                }));
                break;
            case "bw":
            case "greyscale":
            case "svg":
                model.updateConfig(key, value);
                dispatch(actions._updateState({
                    config: _.cloneDeep(model.config),
                    gcode: null
                }));
                break;
        }
    },
    updateWorkingParameters: (key, value) => (dispatch, getState) => {
        const {model} = getState().laser;
        dispatch(actions._updateState({
            working_parameters: _.cloneDeep(model.working_parameters),
            gcode: null
        }));
    },
    //text独有
    updateConfigText: (key, value) => async (dispatch, getState) => {
        const {model} = getState().laser;
        if (!model || model.fileType !== "text") {
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
