import _ from 'lodash';
import {generateSvg, uploadImage} from "../api";
import Model2D from "../containers/laser/lib/Model2D";

const ACTION_UPDATE_STATE = 'laser/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    rendererParent: null,
    model: null, // the selected model
    transformation: null,
    config: null,
    working_parameters: null,
    modelCount: 0,
    isAllPreviewed: false, // 是否所有model全部previewed
    gcode: null,
    config_text: null  // text独有
};

const actions = {
    _updateState: (state) => {
        return {type: ACTION_UPDATE_STATE, state};
    },
    setRendererParent: (object3d) => (dispatch) => {
        dispatch(actions._updateState({rendererParent: object3d}));
    },
    addModel: (fileType, file) => async (dispatch, getState) => {
        if (!["bw", "greyscale", "svg", "text"].includes(fileType)) {
            return {type: null};
        }

        const model = new Model2D(fileType);
        if (fileType === "text") {
            const svg = await generateSvg(model.config_text);
            const filename = "text.svg";
            const blob = new Blob([svg], {type: 'text/plain'});
            file = new File([blob], filename);
        }

        const response = await uploadImage(file);
        const {url, width, height} = response;
        model.loadImg(url, width, height);

        const {rendererParent} = getState().laser;
        for (const child of rendererParent.children) {
            child.setSelected(false);
        }
        rendererParent.add(model);
        model.setSelected(true);

        const {transformation, config, working_parameters} = model.settings;
        const {config_text} = model;
        dispatch(actions._updateState({
            model,
            transformation,
            config,
            working_parameters,
            modelCount: rendererParent.children.length,
            isAllPreviewed: false,
            gcode: null,
            config_text
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

        const {transformation, config, working_parameters} = model.settings;
        const {config_text} = model;
        dispatch(actions._updateState({
            model,
            transformation,
            config,
            working_parameters,
            config_text
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
            transformation: null,
            config: null,
            working_parameters: null,
            modelCount: rendererParent.children.length,
            gcode: null,
            config_text: null
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
            modelCount: rendererParent.children.length,
            transformation: null,
            config: null,
            working_parameters: null,
            gcode: null,
            config_text: null
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
    //update settings
    //TODO: 比较前后settings是否变化；不变则不更新数据
    updateTransformation: (key, value, preview) => (dispatch, getState) => {
        const selected = getState().laser.model;
        const {workHeightLaser} = getState().persistentData;
        if (!selected) {
            return {type: null};
        }
        //TODO: 是否有更？
        selected.updateTransformation(key, value, preview, workHeightLaser);
        dispatch(actions._updateState({
            transformation: _.cloneDeep(selected.settings.transformation),
            gcode: null
        }));
    },
    updateConfig: (key, value) => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (!selected) {
            return {type: null};
        }
        selected.updateConfig(key, value);
        dispatch(actions._updateState({
            config: _.cloneDeep(selected.settings.config),
            gcode: null
        }));
    },
    updateWorkingParameters: (key, value) => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (!selected) {
            return {type: null};
        }
        selected.updateWorkingParameters(key, value);
        dispatch(actions._updateState({
            working_parameters: _.cloneDeep(selected.settings.working_parameters),
            gcode: null
        }));
    },
    //text独有
    updateConfigText: (key, value) => async (dispatch, getState) => {
        const {model} = getState().laser;
        if (!model || model.fileType !== "text") {
            return {type: null};
        }

        const {config_text} = model;
        config_text.children[key].default_value = value;

        const svg = await generateSvg(config_text);
        const filename = "text.svg";
        const blob = new Blob([svg], {type: 'text/plain'});
        const file = new File([blob], filename);

        const response = await uploadImage(file);
        const {url, width, height} = response;
        model.loadImg(url, width, height);
        model.preview();

        dispatch(actions._updateState({
            config_text: _.cloneDeep(config_text),
            transformation: _.cloneDeep(model.settings.transformation),
            isAllPreviewed: false,
            gcode: null
        }));
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
