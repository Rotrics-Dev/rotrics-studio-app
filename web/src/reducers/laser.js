import _ from 'lodash';
import {generateSvg2, uploadImage} from "../api";
import configText from "../containers/Model2D/settings/config/text.json";
import Model2D from "../containers/Model2D/Model2D";

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
    addModel: (fileType, file) => async (dispatch, getState) => {
        console.log('add model: ', fileType, file)
        if (fileType == "text"){
            const text = configText.children.text.default_value;
            const font = configText.children.font.default_value;
            const font_size = configText.children.font_size.default_value;
            const svg = await generateSvg2(text, font, font_size);
            const blob = new Blob([svg], {type: 'text/plain'});
            file = new File([blob], null);
        }

        const response = await uploadImage(file);
        const {url, width, height} = response;
        const model = new Model2D(fileType, 'laser');
        model.loadImg(url, width, height);

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
                if (["font", "font_size", "text"].includes(key)){
                    const {config} = model;
                    const text = config.children.text.default_value;
                    const font = config.children.font.default_value;
                    const font_size = config.children.font_size.default_value;
                    const svg = await generateSvg2(text, font, font_size);
                    const blob = new Blob([svg], {type: 'text/plain'});
                    const file = new File([blob], null);
                    const response = await uploadImage(file);
                    const {url, width, height} = response;
                    model.loadImg(url, width, height);
                }
                model.preview();
                dispatch(actions._updateState({
                    config: _.cloneDeep(model.config),
                    transformation: _.cloneDeep(model.transformation),
                    isAllPreviewed: false,
                    gcode: null
                }));
                break;
            case "bw":
            case "svg":
                model.updateConfig(key, value);
                dispatch(actions._updateState({
                    config: _.cloneDeep(model.config),
                    gcode: null
                }));
                break;
            case "greyscale":
                //if movement_mode change, the working_parameters will changed too
                model.updateConfig(key, value);
                dispatch(actions._updateState({
                    config: _.cloneDeep(model.config),
                    working_parameters: _.cloneDeep(model.working_parameters),
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
